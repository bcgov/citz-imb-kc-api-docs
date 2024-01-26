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

export type Config = {
  expressFilePath: string;
  modulesBasePath: string;
  modules: {
    [module: string]: {
      description: string;
    };
  };
  defaultResponses: (string | number)[][];
};

export type Module = {
  name: string;
  route: string;
  protected: boolean;
  protectedBy: string[];
};

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type Endpoint = {
  route: string;
  method: Method;
  protected: boolean;
  protectedBy: string[];
};

export type ModuleEndpoints = {
  [key: string]: { description: string; endpoints: Endpoint[] };
};
