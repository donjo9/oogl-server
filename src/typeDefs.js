import { gql } from "apollo-server";
export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    team: Team
  }

  type Team {
    id: ID!
    name: String!
    tag: String!
    players: [User]
  }

  type AuthRespons {
    id: String
    token: String
  }

  input SignInPayload {
    username: String
    password: String
  }
  input SignUpPayLoad {
    username: String
    password: String
    email: String
  }

  type Challenge {
    id: ID!
    challengerId: String
    defenderId: String
  }

  input CreateTeamPayload {
    userid: String
    name: String
    tag: String
  }
  input CreateTeamInvitationPayload {
    playerid: String
    teamid: String
  }
  input AcceptTeamInvitationPayload {
    invitationid: String
  }

  input CreateChallengePayload {
    challengerId: String
    defenderId: String
  }

  type Query {
    player(id: String): User
    players: [User]!
    team(id: String): Team
    teams: [Team]!
  }

  type Mutation {
    signin(data: SignInPayload): AuthRespons!
    signup(data: SignUpPayLoad): AuthRespons!
    createTeam(data: CreateTeamPayload): Team!
    createTeamInvitation(data: CreateTeamInvitationPayload): Boolean!
    acceptTeamInvitation(data: AcceptTeamInvitationPayload): Team!
    createGameChallenge(data: CreateChallengePayload): Challenge!
  }
`;
