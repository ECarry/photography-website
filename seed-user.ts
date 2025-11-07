import "dotenv/config";

const email = process.env.SEED_USER_EMAIL ?? "admin@example.com";
const password = process.env.SEED_USER_PASSWORD ?? "StrongPass123!";
const name = process.env.SEED_USER_NAME ?? "Admin";

async function main() {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const url = `${base.replace(/\/$/, "")}/api/auth/sign-up/email`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sign up failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log("User created successfully:", data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
