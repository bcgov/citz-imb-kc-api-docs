import { z } from "zod";

// The token and user properties are not a part of the Request object by default.
declare global {
  namespace Express {
    interface Request {
      token?: string;
      locals?: any;
    }
  }
}

export type IdirIdentityProvider = "idir";
export type BceidIdentityProvider =
  | "bceidbasic"
  | "bceidbusiness"
  | "bceidboth";
export type GithubIdentityProvider = "githubbcgov" | "githubpublic";

export type IdentityProvider =
  | IdirIdentityProvider
  | BceidIdentityProvider
  | GithubIdentityProvider;

export type CustomSchemaConfig = {
  [pattern: string]: QueryParamProperties;
};

export type Config = {
  expressFilePath: string;
  modulesBasePath: string;
  modules: {
    [module: string]: {
      description: string;
    };
  };
  customSchemas?: CustomSchemaConfig;
  defaultResponses: (string | number)[][];
};

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type QueryParamProperties = {
  required: boolean;
  type: "string" | "number" | "boolean";
};

export type Endpoint = {
  route: string;
  method: Method;
  description?: string;
  controller: {
    name: string;
    path: string;
    query?: {
      [param: string]: QueryParamProperties;
    };
    querySchema?: z.ZodSchema<unknown>;
  };
};

export type Modules = {
  [key: string]: {
    description: string;
    protected: boolean;
    protectedBy: string[];
    protectedByAll: boolean;
    endpoints: Endpoint[];
  };
};
