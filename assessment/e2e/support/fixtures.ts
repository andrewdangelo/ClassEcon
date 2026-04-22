import { APIRequestContext, BrowserContext } from "@playwright/test";
import { gql } from "./graphql-client";
import { E2E_ENV } from "./env";
import { Persona, personaEmail, personaName, testPassword, testRunId } from "./test-data";

type AuthPayload = {
  accessToken: string;
  user: { id: string; email: string; name: string; role: string };
};

type ClassSeed = {
  teacher: AuthPayload;
  classId: string;
  className: string;
  joinCode: string;
};

export type ClassSeedWithStudent = ClassSeed & { student: AuthPayload };

const SIGN_UP_MUTATION = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      user { id email name role }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user { id email name role }
    }
  }
`;

const CREATE_CLASS_MUTATION = `
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
      name
    }
  }
`;

const ROTATE_JOIN_CODE_MUTATION = `
  mutation RotateJoinCode($id: ID!) {
    rotateJoinCode(id: $id) {
      id
      joinCode
    }
  }
`;

const CREATE_STORE_ITEM_MUTATION = `
  mutation CreateStoreItem($input: CreateStoreItemInput!) {
    createStoreItem(input: $input) {
      id
      name
      price
    }
  }
`;

const CREATE_JOB_MUTATION = `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
    }
  }
`;

const APPLY_FOR_JOB_MUTATION = `
  mutation ApplyForJob($input: ApplyForJobInput!) {
    applyForJob(input: $input) {
      id
      status
    }
  }
`;

export async function seedAuthPersona(
  request: APIRequestContext,
  persona: Persona,
  role: "TEACHER" | "STUDENT",
  joinCode?: string
): Promise<AuthPayload> {
  const data = await gql<{ signUp: AuthPayload }>(
    request,
    SIGN_UP_MUTATION,
    {
      input: {
        name: personaName(persona),
        email: personaEmail(persona),
        password: testPassword,
        role,
        ...(joinCode ? { joinCode } : {}),
      },
    }
  );
  return data.signUp;
}

export async function loginPersona(
  request: APIRequestContext,
  persona: Persona
): Promise<AuthPayload> {
  const data = await gql<{ login: AuthPayload }>(
    request,
    LOGIN_MUTATION,
    {
      email: personaEmail(persona),
      password: testPassword,
    }
  );
  return data.login;
}

/** Teacher-owned class plus one student already enrolled via join code. */
export async function seedTeacherClassWithStudent(
  request: APIRequestContext,
  teacherPersona: Persona = "teacherA",
  studentPersona: Persona = "studentA"
): Promise<ClassSeedWithStudent> {
  const seeded = await seedTeacherClass(request, teacherPersona);
  const student = await seedAuthPersona(request, studentPersona, "STUDENT", seeded.joinCode);
  return { ...seeded, student };
}

export async function seedTeacherClass(
  request: APIRequestContext,
  persona: Persona = "teacherA"
): Promise<ClassSeed> {
  const teacher = await seedAuthPersona(request, persona, "TEACHER");
  const className = `E2E Class ${testRunId}`;

  const created = await gql<{ createClass: { id: string; name: string } }>(
    request,
    CREATE_CLASS_MUTATION,
    {
      input: {
        name: className,
        subject: "Math",
        period: "Fall",
        defaultCurrency: "CE$",
        startingBalance: 500,
        storeSettings: {
          allowNegative: false,
          requireFineReason: true,
        },
      },
    },
    teacher.accessToken
  );

  const rotated = await gql<{ rotateJoinCode: { joinCode: string } }>(
    request,
    ROTATE_JOIN_CODE_MUTATION,
    { id: created.createClass.id },
    teacher.accessToken
  );

  return {
    teacher,
    classId: created.createClass.id,
    className,
    joinCode: rotated.rotateJoinCode.joinCode,
  };
}

export async function seedStoreItem(
  request: APIRequestContext,
  teacherToken: string,
  classId: string,
  title = "Notebook"
) {
  return gql<{ createStoreItem: { id: string; name: string; price: number } }>(
    request,
    CREATE_STORE_ITEM_MUTATION,
    {
      input: {
        classId,
        title,
        price: 100,
        stock: 20,
        active: true,
      },
    },
    teacherToken
  );
}

export async function seedJob(
  request: APIRequestContext,
  teacherToken: string,
  classId: string,
  title = "Line Leader"
) {
  return gql<{ createJob: { id: string; title: string } }>(
    request,
    CREATE_JOB_MUTATION,
    {
      input: {
        classId,
        title,
        description: "Helps with classroom transitions",
        salary: 25,
        period: "WEEKLY",
        maxCapacity: 1,
        active: true,
      },
    },
    teacherToken
  );
}

export async function seedJobApplication(
  request: APIRequestContext,
  studentToken: string,
  jobId: string
) {
  return gql<{ applyForJob: { id: string; status: string } }>(
    request,
    APPLY_FOR_JOB_MUTATION,
    {
      input: {
        jobId,
        applicationText: "I am organized and reliable.",
      },
    },
    studentToken
  );
}

export async function primeBetaBypass(context: BrowserContext) {
  await context.addInitScript(
    ({ betaCode }) => {
      localStorage.setItem("DISABLE_BETA_CHECK", "true");
      localStorage.setItem("betaAccessValidated", "true");
      localStorage.setItem("betaAccessCode", betaCode);
    },
    { betaCode: E2E_ENV.betaCode }
  );
}
