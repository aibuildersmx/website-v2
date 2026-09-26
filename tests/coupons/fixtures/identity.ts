/** Addresses and the mailbox each one lands in, per `couponIdentity`. */
export const IDENTITY_FIXTURES: Array<[string, string]> = [
  ["saidromero19@gmail.com", "saidromero19@gmail.com"],
  ["SaidRomero19@Gmail.com", "saidromero19@gmail.com"],
  ["said.romero.19@gmail.com", "saidromero19@gmail.com"],
  ["saidromero19+1@gmail.com", "saidromero19@gmail.com"],
  ["saidromero19+b@gmail.com", "saidromero19@gmail.com"],
  ["said.romero19+v+q@gmail.com", "saidromero19@gmail.com"],
  ["saidromero19@googlemail.com", "saidromero19@gmail.com"],
  ["Said.Romero19+e@GoogleMail.com", "saidromero19@gmail.com"],
  ["ana+tag@company.com", "ana+tag@company.com"],
  ["Ana.Maria@Company.com", "ana.maria@company.com"],
  ["a.b@gmail.com.mx", "a.b@gmail.com.mx"],
  ["a.b+x@mail.gmail.com", "a.b+x@mail.gmail.com"],
];

/** The aliases used against grok-bot-cdmx. */
export const ABUSE_ALIASES = ["1", "2", "a", "b", "v", "s", "q", "e"].map((t) => `saidromero19+${t}@gmail.com`);
