import type { NextInstance, NextInstanceOpts } from "./next-instance-base";
import { NextInstanceDev } from "./next-instance-dev";
import { NextInstanceStart } from "./next-instance-start";

const validTestModes = ["dev", "start"] as const;

type NextTestMode = (typeof validTestModes)[number];

interface NextTestOpts extends NextInstanceOpts {
  sourceDir: string;
}

const isValidTestMode = (mode: string | undefined): mode is NextTestMode =>
  typeof mode === "string" && validTestModes.includes(mode as any);

let testMode: NextTestMode = "start";

const envTestMode = process.env.NEXT_TEST_MODE;

if (isValidTestMode(envTestMode)) {
  testMode = envTestMode;
}

const createNext = async (opts: NextTestOpts) => {
  let nextInstance: NextInstance | undefined = undefined;
  try {
    switch (testMode) {
      case "dev":
        nextInstance = new NextInstanceDev(opts);
        break;
      case "start":
        nextInstance = new NextInstanceStart(opts);
        break;
    }
    await nextInstance.setup(opts.sourceDir);
    await nextInstance.spawn();
    return nextInstance;
  } catch (err) {
    console.error(
      `failed to create next instance: ${JSON.stringify(err, null, 2)}`
    );
    try {
      await nextInstance?.destroy();
    } catch {
      // do nothing
    }
    process.exit(1);
  }
};

export const createDescribe = (
  name: string,
  opts: NextTestOpts,
  fn: (args: { next: NextInstance; testMode: NextTestMode }) => void
) => {
  describe(name, () => {
    let next: NextInstance;
    beforeAll(async () => {
      next = await createNext(opts);
    });
    afterAll(async () => {
      await next.destroy();
    });
    const nextProxy = new Proxy<NextInstance>({} as NextInstance, {
      get(_target, property: keyof NextInstance) {
        const prop = next[property];
        return typeof prop === "function" ? prop.bind(next) : prop;
      },
    });
    fn({ next: nextProxy, testMode });
  });
};
