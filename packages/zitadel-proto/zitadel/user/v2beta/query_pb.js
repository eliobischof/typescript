// @generated by protoc-gen-es v1.9.0
// @generated from file zitadel/user/v2beta/query.proto (package zitadel.user.v2beta, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { proto3 } from "@bufbuild/protobuf";
import { TextQueryMethod } from "../../object/v2beta/object_pb.js";
import { UserState } from "./user_pb.js";

/**
 * @generated from enum zitadel.user.v2beta.Type
 */
export const Type = /*@__PURE__*/ proto3.makeEnum(
  "zitadel.user.v2beta.Type",
  [
    {no: 0, name: "TYPE_UNSPECIFIED", localName: "UNSPECIFIED"},
    {no: 1, name: "TYPE_HUMAN", localName: "HUMAN"},
    {no: 2, name: "TYPE_MACHINE", localName: "MACHINE"},
  ],
);

/**
 * @generated from enum zitadel.user.v2beta.UserFieldName
 */
export const UserFieldName = /*@__PURE__*/ proto3.makeEnum(
  "zitadel.user.v2beta.UserFieldName",
  [
    {no: 0, name: "USER_FIELD_NAME_UNSPECIFIED", localName: "UNSPECIFIED"},
    {no: 1, name: "USER_FIELD_NAME_USER_NAME", localName: "USER_NAME"},
    {no: 2, name: "USER_FIELD_NAME_FIRST_NAME", localName: "FIRST_NAME"},
    {no: 3, name: "USER_FIELD_NAME_LAST_NAME", localName: "LAST_NAME"},
    {no: 4, name: "USER_FIELD_NAME_NICK_NAME", localName: "NICK_NAME"},
    {no: 5, name: "USER_FIELD_NAME_DISPLAY_NAME", localName: "DISPLAY_NAME"},
    {no: 6, name: "USER_FIELD_NAME_EMAIL", localName: "EMAIL"},
    {no: 7, name: "USER_FIELD_NAME_STATE", localName: "STATE"},
    {no: 8, name: "USER_FIELD_NAME_TYPE", localName: "TYPE"},
    {no: 9, name: "USER_FIELD_NAME_CREATION_DATE", localName: "CREATION_DATE"},
  ],
);

/**
 * @generated from message zitadel.user.v2beta.SearchQuery
 */
export const SearchQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.SearchQuery",
  () => [
    { no: 1, name: "user_name_query", kind: "message", T: UserNameQuery, oneof: "query" },
    { no: 2, name: "first_name_query", kind: "message", T: FirstNameQuery, oneof: "query" },
    { no: 3, name: "last_name_query", kind: "message", T: LastNameQuery, oneof: "query" },
    { no: 4, name: "nick_name_query", kind: "message", T: NickNameQuery, oneof: "query" },
    { no: 5, name: "display_name_query", kind: "message", T: DisplayNameQuery, oneof: "query" },
    { no: 6, name: "email_query", kind: "message", T: EmailQuery, oneof: "query" },
    { no: 7, name: "state_query", kind: "message", T: StateQuery, oneof: "query" },
    { no: 8, name: "type_query", kind: "message", T: TypeQuery, oneof: "query" },
    { no: 9, name: "login_name_query", kind: "message", T: LoginNameQuery, oneof: "query" },
    { no: 10, name: "in_user_ids_query", kind: "message", T: InUserIDQuery, oneof: "query" },
    { no: 11, name: "or_query", kind: "message", T: OrQuery, oneof: "query" },
    { no: 12, name: "and_query", kind: "message", T: AndQuery, oneof: "query" },
    { no: 13, name: "not_query", kind: "message", T: NotQuery, oneof: "query" },
    { no: 14, name: "in_user_emails_query", kind: "message", T: InUserEmailsQuery, oneof: "query" },
    { no: 15, name: "organization_id_query", kind: "message", T: OrganizationIdQuery, oneof: "query" },
  ],
);

/**
 * Connect multiple sub-condition with and OR operator.
 *
 * @generated from message zitadel.user.v2beta.OrQuery
 */
export const OrQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.OrQuery",
  () => [
    { no: 1, name: "queries", kind: "message", T: SearchQuery, repeated: true },
  ],
);

/**
 * Connect multiple sub-condition with and AND operator.
 *
 * @generated from message zitadel.user.v2beta.AndQuery
 */
export const AndQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.AndQuery",
  () => [
    { no: 1, name: "queries", kind: "message", T: SearchQuery, repeated: true },
  ],
);

/**
 * Negate the sub-condition.
 *
 * @generated from message zitadel.user.v2beta.NotQuery
 */
export const NotQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.NotQuery",
  () => [
    { no: 1, name: "query", kind: "message", T: SearchQuery },
  ],
);

/**
 * Query for users with ID in list of IDs.
 *
 * @generated from message zitadel.user.v2beta.InUserIDQuery
 */
export const InUserIDQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.InUserIDQuery",
  () => [
    { no: 1, name: "user_ids", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ],
);

/**
 * Query for users with a specific user name.
 *
 * @generated from message zitadel.user.v2beta.UserNameQuery
 */
export const UserNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.UserNameQuery",
  () => [
    { no: 1, name: "user_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific first name.
 *
 * @generated from message zitadel.user.v2beta.FirstNameQuery
 */
export const FirstNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.FirstNameQuery",
  () => [
    { no: 1, name: "first_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific last name.
 *
 * @generated from message zitadel.user.v2beta.LastNameQuery
 */
export const LastNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.LastNameQuery",
  () => [
    { no: 1, name: "last_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific nickname.
 *
 * @generated from message zitadel.user.v2beta.NickNameQuery
 */
export const NickNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.NickNameQuery",
  () => [
    { no: 1, name: "nick_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific display name.
 *
 * @generated from message zitadel.user.v2beta.DisplayNameQuery
 */
export const DisplayNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.DisplayNameQuery",
  () => [
    { no: 1, name: "display_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific email.
 *
 * @generated from message zitadel.user.v2beta.EmailQuery
 */
export const EmailQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.EmailQuery",
  () => [
    { no: 1, name: "email_address", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific state.
 *
 * @generated from message zitadel.user.v2beta.LoginNameQuery
 */
export const LoginNameQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.LoginNameQuery",
  () => [
    { no: 1, name: "login_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "method", kind: "enum", T: proto3.getEnumType(TextQueryMethod) },
  ],
);

/**
 * Query for users with a specific state.
 *
 * @generated from message zitadel.user.v2beta.StateQuery
 */
export const StateQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.StateQuery",
  () => [
    { no: 1, name: "state", kind: "enum", T: proto3.getEnumType(UserState) },
  ],
);

/**
 * Query for users with a specific type.
 *
 * @generated from message zitadel.user.v2beta.TypeQuery
 */
export const TypeQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.TypeQuery",
  () => [
    { no: 1, name: "type", kind: "enum", T: proto3.getEnumType(Type) },
  ],
);

/**
 * Query for users with email in list of emails.
 *
 * @generated from message zitadel.user.v2beta.InUserEmailsQuery
 */
export const InUserEmailsQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.InUserEmailsQuery",
  () => [
    { no: 1, name: "user_emails", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ],
);

/**
 * Query for users under a specific organization as resource owner.
 *
 * @generated from message zitadel.user.v2beta.OrganizationIdQuery
 */
export const OrganizationIdQuery = /*@__PURE__*/ proto3.makeMessageType(
  "zitadel.user.v2beta.OrganizationIdQuery",
  () => [
    { no: 1, name: "organization_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);
