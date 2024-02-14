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
  [pattern: string]: ParamProperties;
};

export type CustomControllerConfig = {
  [controller: string]: {
    description: string;
    query?: {
      [param: string]: ParamProperties;
    };
  };
};

export type Config = {
  title: string;
  expressFilePath: string;
  modulesBasePath: string;
  modules: {
    [module: string]: {
      description: string;
    };
  };
  customSchemas?: CustomSchemaConfig;
  customControllers?: CustomControllerConfig;
  defaultResponses: (string | number)[][];
};

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ParamProperties = {
  required: boolean;
  type: string;
};

export type Endpoint = {
  route: string;
  method: Method;
  description?: string;
  controller: {
    name: string;
    path: string;
    query?: {
      [param: string]: ParamProperties;
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
