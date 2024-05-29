// @generated by protoc-gen-es v1.9.0
// @generated from file zitadel/oidc/v2beta/authorization.proto (package zitadel.oidc.v2beta, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { Duration, proto3, Timestamp } from "@bufbuild/protobuf";

/**
 * @generated from enum zitadel.oidc.v2beta.Prompt
 */
export const Prompt = /*@__PURE__*/ proto3.makeEnum(
  "zitadel.oidc.v2beta.Prompt",
  [
    {no: 0, name: "PROMPT_UNSPECIFIED", localName: "UNSPECIFIED"},
    {no: 1, name: "PROMPT_NONE", localName: "NONE"},
    {no: 2, name: "PROMPT_LOGIN", localName: "LOGIN"},
    {no: 3, name: "PROMPT_CONSENT", localName: "CONSENT"},
    {no: 4, name: "PROMPT_SELECT_ACCOUNT", localName: "SELECT_ACCOUNT"},
    {no: 5, name: "PROMPT_CREATE", localName: "CREATE"},
  ],
);

/**
 * @generated from enum zitadel.oidc.v2beta.ErrorReason
 */
export const ErrorReason = /*@__PURE__*/ proto3.makeEnum(
  "zitadel.oidc.v2beta.ErrorReason",
  [
    {no: 0, name: "ERROR_REASON_UNSPECIFIED", localName: "UNSPECIFIED"},
    {no: 1, name: "ERROR_REASON_INVALID_REQUEST", localName: "INVALID_REQUEST"},
    {no: 2, name: "ERROR_REASON_UNAUTHORIZED_CLIENT", localName: "UNAUTHORIZED_CLIENT"},
    {no: 3, name: "ERROR_REASON_ACCESS_DENIED", localName: "ACCESS_DENIED"},
    {no: 4, name: "ERROR_REASON_UNSUPPORTED_RESPONSE_TYPE", localName: "UNSUPPORTED_RESPONSE_TYPE"},
    {no: 5, name: "ERROR_REASON_INVALID_SCOPE", localName: "INVALID_SCOPE"},
    {no: 6, name: "ERROR_REASON_SERVER_ERROR", localName: "SERVER_ERROR"},
    {no: 7, name: "ERROR_REASON_TEMPORARY_UNAVAILABLE", localName: "TEMPORARY_UNAVAILABLE"},
    {no: 8, name: "ERROR_REASON_INTERACTION_REQUIRED", localName: "INTERACTION_REQUIRED"},
    {no: 9, name: "ERROR_REASON_LOGIN_REQUIRED", localName: "LOGIN_REQUIRED"},
    {no: 10, name: "ERROR_REASON_ACCOUNT_SELECTION_REQUIRED", localName: "ACCOUNT_SELECTION_REQUIRED"},
    {no: 11, name: "ERROR_REASON_CONSENT_REQUIRED", localName: "CONSENT_REQUIRED"},
    {no: 12, name: "ERROR_REASON_INVALID_REQUEST_URI", localName: "INVALID_REQUEST_URI"},
    {no: 13, name: "ERROR_REASON_INVALID_REQUEST_OBJECT", localName: "INVALID_REQUEST_OBJECT"},
    {no: 14, name: "ERROR_REASON_REQUEST_NOT_SUPPORTED", localName: "REQUEST_NOT_SUPPORTED"},
    {no: 15, name: "ERROR_REASON_REQUEST_URI_NOT_SUPPORTED", localName: "REQUEST_URI_NOT_SUPPORTED"},
    {no: 16, name: "ERROR_REASON_REGISTRATION_NOT_SUPPORTED", localName: "REGISTRATION_NOT_SUPPORTED"},
  ],
);

/**
 * @generated from message zitadel.oidc.v2beta.AuthRequest
 */
export const AuthRequest = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.oidc.v2beta.AuthRequest",
  () => [
    { no: 1, name: "id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "creation_date", kind: "message", T: Timestamp },
    { no: 3, name: "client_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "scope", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 5, name: "redirect_uri", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "prompt", kind: "enum", T: proto3.getEnumType(Prompt), repeated: true },
    { no: 7, name: "ui_locales", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 8, name: "login_hint", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 9, name: "max_age", kind: "message", T: Duration, opt: true },
    { no: 10, name: "hint_user_id", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
  ],
);

/**
 * @generated from message zitadel.oidc.v2beta.AuthorizationError
 */
export const AuthorizationError = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.oidc.v2beta.AuthorizationError",
  () => [
    { no: 1, name: "error", kind: "enum", T: proto3.getEnumType(ErrorReason) },
    { no: 2, name: "error_description", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    { no: 3, name: "error_uri", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
  ],
);
