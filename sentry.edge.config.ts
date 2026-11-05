import * as Sentry from "@sentry/nextjs";

import { sharedSentryOptions } from "./src/lib/sentry-options";

Sentry.init(sharedSentryOptions);
