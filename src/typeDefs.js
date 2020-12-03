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

  input CreateTeamPayload {
    userid: String
    name: String
    tag: String
  }

  input AddPlayerPayload {
    userid: String
    teamid: String
  }

  type Query {
    me(id: String): User
    team(id: String): Team
    teams: [Team]!
  }

  type Mutation {
    signin(data: SignInPayload): AuthRespons
    signup(data: SignUpPayLoad): AuthRespons
    createTeam(data: CreateTeamPayload): Team
    addPlayer(data: AddPlayerPayload): Team
  }
`;