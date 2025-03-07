import { getAllSessions } from "@/lib/cookies";
import { idpTypeToSlug } from "@/lib/idp";
import { sendLoginname, SendLoginnameCommand } from "@/lib/server/loginname";
import { getServiceUrlFromHeaders } from "@/lib/service";
import {
  createCallback,
  getActiveIdentityProviders,
  getAuthRequest,
  getLoginSettings,
  getOrgsByDomain,
  listAuthenticationMethodTypes,
  listSessions,
  startIdentityProviderFlow,
} from "@/lib/zitadel";
import { create, timestampDate } from "@zitadel/client";
import {
  AuthRequest,
  Prompt,
} from "@zitadel/proto/zitadel/oidc/v2/authorization_pb";
import {
  CreateCallbackRequestSchema,
  SessionSchema,
} from "@zitadel/proto/zitadel/oidc/v2/oidc_service_pb";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { AuthenticationMethodType } from "@zitadel/proto/zitadel/user/v2/user_service_pb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "default-no-store";

async function loadSessions({
  serviceUrl,
  ids,
}: {
  serviceUrl: string;

  ids: string[];
}): Promise<Session[]> {
  const response = await listSessions({
    serviceUrl,
    ids: ids.filter((id: string | undefined) => !!id),
  });

  return response?.sessions ?? [];
}

const ORG_SCOPE_REGEX = /urn:zitadel:iam:org:id:([0-9]+)/;
const ORG_DOMAIN_SCOPE_REGEX = /urn:zitadel:iam:org:domain:primary:(.+)/; // TODO: check regex for all domain character options
const IDP_SCOPE_REGEX = /urn:zitadel:iam:org:idp:id:(.+)/;

/**
 * mfa is required, session is not valid anymore (e.g. session expired, user logged out, etc.)
 * to check for mfa for automatically selected session -> const response = await listAuthenticationMethodTypes(userId);
 **/
async function isSessionValid(
  serviceUrl: string,

  session: Session,
): Promise<boolean> {
  // session can't be checked without user
  if (!session.factors?.user) {
    console.warn("Session has no user");
    return false;
  }

  let mfaValid = true;

  const authMethodTypes = await listAuthenticationMethodTypes({
    serviceUrl,

    userId: session.factors.user.id,
  });

  const authMethods = authMethodTypes.authMethodTypes;
  if (authMethods && authMethods.includes(AuthenticationMethodType.TOTP)) {
    mfaValid = !!session.factors.totp?.verifiedAt;
    if (!mfaValid) {
      console.warn(
        "Session has no valid totpEmail factor",
        session.factors.totp?.verifiedAt,
      );
    }
  } else if (
    authMethods &&
    authMethods.includes(AuthenticationMethodType.OTP_EMAIL)
  ) {
    mfaValid = !!session.factors.otpEmail?.verifiedAt;
    if (!mfaValid) {
      console.warn(
        "Session has no valid otpEmail factor",
        session.factors.otpEmail?.verifiedAt,
      );
    }
  } else if (
    authMethods &&
    authMethods.includes(AuthenticationMethodType.OTP_SMS)
  ) {
    mfaValid = !!session.factors.otpSms?.verifiedAt;
    if (!mfaValid) {
      console.warn(
        "Session has no valid otpSms factor",
        session.factors.otpSms?.verifiedAt,
      );
    }
  } else if (
    authMethods &&
    authMethods.includes(AuthenticationMethodType.U2F)
  ) {
    mfaValid = !!session.factors.webAuthN?.verifiedAt;
    if (!mfaValid) {
      console.warn(
        "Session has no valid u2f factor",
        session.factors.webAuthN?.verifiedAt,
      );
    }
  } else {
    // only check settings if no auth methods are available, as this would require a setup
    const loginSettings = await getLoginSettings({
      serviceUrl,

      organization: session.factors?.user?.organizationId,
    });
    if (loginSettings?.forceMfa || loginSettings?.forceMfaLocalOnly) {
      const otpEmail = session.factors.otpEmail?.verifiedAt;
      const otpSms = session.factors.otpSms?.verifiedAt;
      const totp = session.factors.totp?.verifiedAt;
      const webAuthN = session.factors.webAuthN?.verifiedAt;
      const idp = session.factors.intent?.verifiedAt; // TODO: forceMFA should not consider this as valid factor

      // must have one single check
      mfaValid = !!(otpEmail || otpSms || totp || webAuthN || idp);
      if (!mfaValid) {
        console.warn("Session has no valid multifactor", session.factors);
      }
    } else {
      mfaValid = true;
    }
  }

  const validPassword = session?.factors?.password?.verifiedAt;
  const validPasskey = session?.factors?.webAuthN?.verifiedAt;
  const validIDP = session?.factors?.intent?.verifiedAt;

  const stillValid = session.expirationDate
    ? timestampDate(session.expirationDate).getTime() > new Date().getTime()
    : true;

  if (!stillValid) {
    console.warn(
      "Session is expired",
      session.expirationDate
        ? timestampDate(session.expirationDate).toDateString()
        : "no expiration date",
    );
  }

  const validChecks = !!(validPassword || validPasskey || validIDP);

  return stillValid && validChecks && mfaValid;
}

async function findValidSession(
  serviceUrl: string,

  sessions: Session[],
  authRequest: AuthRequest,
): Promise<Session | undefined> {
  const sessionsWithHint = sessions.filter((s) => {
    if (authRequest.hintUserId) {
      return s.factors?.user?.id === authRequest.hintUserId;
    }
    if (authRequest.loginHint) {
      return s.factors?.user?.loginName === authRequest.loginHint;
    }
    return true;
  });

  if (sessionsWithHint.length === 0) {
    return undefined;
  }

  // sort by change date descending
  sessionsWithHint.sort((a, b) => {
    const dateA = a.changeDate ? timestampDate(a.changeDate).getTime() : 0;
    const dateB = b.changeDate ? timestampDate(b.changeDate).getTime() : 0;
    return dateB - dateA;
  });

  // return the first valid session according to settings
  for (const session of sessionsWithHint) {
    if (await isSessionValid(serviceUrl, session)) {
      return session;
    }
  }

  return undefined;
}

function constructUrl(request: NextRequest, path: string) {
  const forwardedHost =
    request.headers.get("x-zitadel-forward-host") ??
    request.headers.get("host");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return new URL(
    `${basePath}${path}`,
    forwardedHost?.startsWith("http")
      ? forwardedHost
      : `https://${forwardedHost}`,
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authRequestId = searchParams.get("authRequest");
  const sessionId = searchParams.get("sessionId");

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  // TODO: find a better way to handle _rsc (react server components) requests and block them to avoid conflicts when creating oidc callback
  const _rsc = searchParams.get("_rsc");
  if (_rsc) {
    return NextResponse.json({ error: "No _rsc supported" }, { status: 500 });
  }

  const sessionCookies = await getAllSessions();
  const ids = sessionCookies.map((s) => s.id);
  let sessions: Session[] = [];
  if (ids && ids.length) {
    sessions = await loadSessions({ serviceUrl, ids });
  }

  if (authRequestId && sessionId) {
    console.log(
      `Login with session: ${sessionId} and authRequest: ${authRequestId}`,
    );

    const selectedSession = sessions.find((s) => s.id === sessionId);

    if (selectedSession && selectedSession.id) {
      console.log(`Found session ${selectedSession.id}`);

      const isValid = await isSessionValid(
        serviceUrl,

        selectedSession,
      );

      console.log("Session is valid:", isValid);

      if (!isValid && selectedSession.factors?.user) {
        // if the session is not valid anymore, we need to redirect the user to re-authenticate /
        // TODO: handle IDP intent direcly if available
        const command: SendLoginnameCommand = {
          loginName: selectedSession.factors.user?.loginName,
          organization: selectedSession.factors?.user?.organizationId,
          authRequestId: authRequestId,
        };

        const res = await sendLoginname(command);

        if (res && "redirect" in res && res?.redirect) {
          const absoluteUrl = new URL(res.redirect, request.nextUrl);
          return NextResponse.redirect(absoluteUrl.toString());
        }
      }

      const cookie = sessionCookies.find(
        (cookie) => cookie.id === selectedSession?.id,
      );

      if (cookie && cookie.id && cookie.token) {
        const session = {
          sessionId: cookie?.id,
          sessionToken: cookie?.token,
        };

        // works not with _rsc request
        try {
          const { callbackUrl } = await createCallback({
            serviceUrl,

            req: create(CreateCallbackRequestSchema, {
              authRequestId,
              callbackKind: {
                case: "session",
                value: create(SessionSchema, session),
              },
            }),
          });
          if (callbackUrl) {
            return NextResponse.redirect(callbackUrl);
          } else {
            return NextResponse.json(
              { error: "An error occurred!" },
              { status: 500 },
            );
          }
        } catch (error: unknown) {
          // handle already handled gracefully as these could come up if old emails with authRequestId are used (reset password, register emails etc.)
          console.error(error);
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error?.code === 9
          ) {
            const loginSettings = await getLoginSettings({
              serviceUrl,

              organization: selectedSession.factors?.user?.organizationId,
            });

            if (loginSettings?.defaultRedirectUri) {
              return NextResponse.redirect(loginSettings.defaultRedirectUri);
            }

            const signedinUrl = constructUrl(request, "/signedin");
            const params = new URLSearchParams();

            if (selectedSession.factors?.user?.loginName) {
              params.append(
                "loginName",
                selectedSession.factors?.user?.loginName,
              );
              // signedinUrl.searchParams.set(
              //   "loginName",
              //   selectedSession.factors?.user?.loginName,
              // );
            }
            if (selectedSession.factors?.user?.organizationId) {
              params.append(
                "organization",
                selectedSession.factors?.user?.organizationId,
              );
              // signedinUrl.searchParams.set(
              //   "organization",
              //   selectedSession.factors?.user?.organizationId,
              // );
            }
            return NextResponse.redirect(signedinUrl + "?" + params);
          } else {
            return NextResponse.json({ error }, { status: 500 });
          }
        }
      }
    }
  }

  if (authRequestId) {
    const { authRequest } = await getAuthRequest({
      serviceUrl,

      authRequestId,
    });

    let organization = "";
    let suffix = "";
    let idpId = "";

    if (authRequest?.scope) {
      const orgScope = authRequest.scope.find((s: string) =>
        ORG_SCOPE_REGEX.test(s),
      );

      const idpScope = authRequest.scope.find((s: string) =>
        IDP_SCOPE_REGEX.test(s),
      );

      if (orgScope) {
        const matched = ORG_SCOPE_REGEX.exec(orgScope);
        organization = matched?.[1] ?? "";
      } else {
        const orgDomainScope = authRequest.scope.find((s: string) =>
          ORG_DOMAIN_SCOPE_REGEX.test(s),
        );

        if (orgDomainScope) {
          const matched = ORG_DOMAIN_SCOPE_REGEX.exec(orgDomainScope);
          const orgDomain = matched?.[1] ?? "";
          if (orgDomain) {
            const orgs = await getOrgsByDomain({
              serviceUrl,

              domain: orgDomain,
            });
            if (orgs.result && orgs.result.length === 1) {
              organization = orgs.result[0].id ?? "";
              suffix = orgDomain;
            }
          }
        }
      }

      if (idpScope) {
        const matched = IDP_SCOPE_REGEX.exec(idpScope);
        idpId = matched?.[1] ?? "";

        const identityProviders = await getActiveIdentityProviders({
          serviceUrl,

          orgId: organization ? organization : undefined,
        }).then((resp) => {
          return resp.identityProviders;
        });

        const idp = identityProviders.find((idp) => idp.id === idpId);

        if (idp) {
          const origin = request.nextUrl.origin;

          const identityProviderType = identityProviders[0].type;
          let provider = idpTypeToSlug(identityProviderType);

          const params = new URLSearchParams();

          if (authRequestId) {
            params.set("authRequestId", authRequestId);
          }

          if (organization) {
            params.set("organization", organization);
          }

          return startIdentityProviderFlow({
            serviceUrl,

            idpId,
            urls: {
              successUrl:
                `${origin}/idp/${provider}/success?` +
                new URLSearchParams(params),
              failureUrl:
                `${origin}/idp/${provider}/failure?` +
                new URLSearchParams(params),
            },
          }).then((resp) => {
            if (
              resp.nextStep.value &&
              typeof resp.nextStep.value === "string"
            ) {
              return NextResponse.redirect(resp.nextStep.value);
            }
          });
        }
      }
    }

    const gotoAccounts = (): NextResponse<unknown> => {
      const accountsUrl = constructUrl(request, "/accounts");
      const params = new URLSearchParams();
      if (authRequest?.id) {
        params.append("authRequestId", authRequest.id);
        // accountsUrl.searchParams.set("authRequestId", authRequest?.id);
      }
      if (organization) {
        params.append("organization", organization);
        // accountsUrl.searchParams.set("organization", organization);
      }

      return NextResponse.redirect(accountsUrl + "?" + params);
    };

    if (authRequest && authRequest.prompt.includes(Prompt.CREATE)) {
      const registerUrl = constructUrl(request, "/register");
      const params = new URLSearchParams();
      if (authRequest.id) {
        params.append("authRequestId", authRequest.id);
        // registerUrl.searchParams.set("authRequestId", authRequest.id);
      }
      if (organization) {
        params.append("organization", organization);
        // registerUrl.searchParams.set("organization", organization);
      }

      return NextResponse.redirect(registerUrl + "?" + params);
    }

    // use existing session and hydrate it for oidc
    if (authRequest && sessions.length) {
      // if some accounts are available for selection and select_account is set
      if (authRequest.prompt.includes(Prompt.SELECT_ACCOUNT)) {
        return gotoAccounts();
      } else if (authRequest.prompt.includes(Prompt.LOGIN)) {
        /**
         * The login prompt instructs the authentication server to prompt the user for re-authentication, regardless of whether the user is already authenticated
         */

        // if a hint is provided, skip loginname page and jump to the next page
        if (authRequest.loginHint) {
          try {
            let command: SendLoginnameCommand = {
              loginName: authRequest.loginHint,
              authRequestId: authRequest.id,
            };

            if (organization) {
              command = { ...command, organization };
            }

            const res = await sendLoginname(command);

            if (res && "redirect" in res && res?.redirect) {
              const absoluteUrl = new URL(res.redirect, request.nextUrl);
              return NextResponse.redirect(absoluteUrl.toString());
            }
          } catch (error) {
            console.error("Failed to execute sendLoginname:", error);
          }
        }

        const loginNameUrl = constructUrl(request, "/loginname");

        const params = new URLSearchParams();

        if (authRequest.id) {
          params.append("authRequestId", authRequest.id);
          // loginNameUrl.searchParams.set("authRequestId", authRequest.id);
        }
        if (authRequest.loginHint) {
          params.append("loginName", authRequest.loginHint);
          // loginNameUrl.searchParams.set("loginName", authRequest.loginHint);
        }
        if (organization) {
          params.append("organization", organization);
          // loginNameUrl.searchParams.set("organization", organization);
        }
        if (suffix) {
          params.append("suffix", suffix);
          // loginNameUrl.searchParams.set("suffix", suffix);
        }
        return NextResponse.redirect(loginNameUrl + "?" + params);
      } else if (authRequest.prompt.includes(Prompt.NONE)) {
        /**
         * With an OIDC none prompt, the authentication server must not display any authentication or consent user interface pages.
         * This means that the user should not be prompted to enter their password again.
         * Instead, the server attempts to silently authenticate the user using an existing session or other authentication mechanisms that do not require user interaction
         **/
        const selectedSession = await findValidSession(
          serviceUrl,

          sessions,
          authRequest,
        );

        if (!selectedSession || !selectedSession.id) {
          return NextResponse.json(
            { error: "No active session found" },
            { status: 400 },
          );
        }

        const cookie = sessionCookies.find(
          (cookie) => cookie.id === selectedSession.id,
        );

        if (!cookie || !cookie.id || !cookie.token) {
          return NextResponse.json(
            { error: "No active session found" },
            { status: 400 },
          );
        }

        const session = {
          sessionId: cookie.id,
          sessionToken: cookie.token,
        };

        const { callbackUrl } = await createCallback({
          serviceUrl,

          req: create(CreateCallbackRequestSchema, {
            authRequestId,
            callbackKind: {
              case: "session",
              value: create(SessionSchema, session),
            },
          }),
        });
        return NextResponse.redirect(callbackUrl);
      } else {
        // check for loginHint, userId hint and valid sessions
        let selectedSession = await findValidSession(
          serviceUrl,

          sessions,
          authRequest,
        );

        if (!selectedSession || !selectedSession.id) {
          return gotoAccounts();
        }

        const cookie = sessionCookies.find(
          (cookie) => cookie.id === selectedSession.id,
        );

        if (!cookie || !cookie.id || !cookie.token) {
          return gotoAccounts();
        }

        const session = {
          sessionId: cookie.id,
          sessionToken: cookie.token,
        };

        try {
          const { callbackUrl } = await createCallback({
            serviceUrl,

            req: create(CreateCallbackRequestSchema, {
              authRequestId,
              callbackKind: {
                case: "session",
                value: create(SessionSchema, session),
              },
            }),
          });
          if (callbackUrl) {
            return NextResponse.redirect(callbackUrl);
          } else {
            console.log(
              "could not create callback, redirect user to choose other account",
            );
            return gotoAccounts();
          }
        } catch (error) {
          console.error(error);
          return gotoAccounts();
        }
      }
    } else {
      const loginNameUrl = constructUrl(request, "/loginname");

      const params = new URLSearchParams();
      params.set("authRequestId", authRequestId);
      // loginNameUrl.searchParams.set("authRequestId", authRequestId);
      if (authRequest?.loginHint) {
        params.set("loginName", authRequest.loginHint);
        params.set("submit", "true"); // autosubmit
        // loginNameUrl.searchParams.set("loginName", authRequest.loginHint);
        // loginNameUrl.searchParams.set("submit", "true"); // autosubmit
      }

      if (organization) {
        params.set("organization", organization);
        // loginNameUrl.searchParams.set("organization", organization);
      }

      return NextResponse.redirect(loginNameUrl + "?" + params);
    }
  } else {
    return NextResponse.json(
      { error: "No authRequestId provided" },
      { status: 500 },
    );
  }
}
