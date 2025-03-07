import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { GetSessionResponse } from "@zitadel/proto/zitadel/session/v2/session_service_pb";
import { getMostRecentCookieWithLoginname } from "./cookies";
import { getSession } from "./zitadel";

type LoadMostRecentSessionParams = {
  serviceUrl: string;

  sessionParams: {
    loginName?: string;
    organization?: string;
  };
};

export async function loadMostRecentSession({
  serviceUrl,

  sessionParams,
}: LoadMostRecentSessionParams): Promise<Session | undefined> {
  const recent = await getMostRecentCookieWithLoginname({
    loginName: sessionParams.loginName,
    organization: sessionParams.organization,
  });

  return getSession({
    serviceUrl,

    sessionId: recent.id,
    sessionToken: recent.token,
  }).then((resp: GetSessionResponse) => resp.session);
}
