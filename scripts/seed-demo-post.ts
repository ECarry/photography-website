import "dotenv/config";
import { db } from "../src/db";
import { posts } from "../src/db/schema";
import { eq } from "drizzle-orm";

const slug = process.env.DEMO_POST_SLUG ?? "style-showcase";

// NOTE: Content is stored as HTML (tiptap editor.getHTML()).
// Headings need the `tiptap-heading` class and lists the `list-disc`/
// `list-decimal` classes so the editor.css styles apply on the blog page.
const content = `
<h1 class="tiptap-heading">The Complete Style Showcase</h1>
<p>This demo article exists to show <strong>every supported text style</strong> in one place. Use it to verify the blog typography looks great in both <em>light</em> and <u>dark</u> mode.</p>

<h2 class="tiptap-heading">Inline formatting</h2>
<p>You can write <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, and <s>strikethrough</s> text. Combine them for <strong><em>bold italic</em></strong> emphasis. Add <code>inline code</code> for short snippets like <code>npm run dev</code>.</p>
<p>Links are styled too — visit the <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js website</a> for more information.</p>

<h2 class="tiptap-heading">Colors &amp; highlights</h2>
<p>Use <span style="color: #2563eb">colored text</span>, <span style="color: #16a34a">green text</span>, and <span style="color: #dc2626">red text</span> to draw attention.</p>
<p>Or <mark data-color="#fef9c3" style="background-color: #fef9c3">highlight important parts</mark> and <mark data-color="#dbeafe" style="background-color: #dbeafe">key takeaways</mark> in a sentence.</p>
<p><span style="font-size: 24px">Larger font size</span> and <span style="font-size: 12px">smaller font size</span> are both supported.</p>

<h2 class="tiptap-heading">Headings hierarchy</h2>
<h3 class="tiptap-heading">This is a level 3 heading</h3>
<p>Body text following a heading keeps comfortable spacing and line height for easy reading across long paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

<h2 class="tiptap-heading">Lists</h2>
<p>Unordered list:</p>
<ul class="list-disc">
  <li><p>First bullet point</p></li>
  <li><p>Second bullet point with <strong>bold</strong> text</p></li>
  <li><p>Third bullet point</p></li>
</ul>
<p>Ordered list:</p>
<ol class="list-decimal">
  <li><p>Choose your camera settings</p></li>
  <li><p>Compose the shot</p></li>
  <li><p>Review and edit</p></li>
</ol>

<h2 class="tiptap-heading">Blockquote</h2>
<blockquote><p>"The best camera is the one that's with you." — A reminder that great photography is about seeing, not gear.</p></blockquote>

<h2 class="tiptap-heading">Code block</h2>
<pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));</code></pre>

<h2 class="tiptap-heading">Text alignment</h2>
<p style="text-align: left">This paragraph is left aligned.</p>
<p style="text-align: center">This paragraph is center aligned.</p>
<p style="text-align: right">This paragraph is right aligned.</p>

<hr>

<h2 class="tiptap-heading">Image</h2>
<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80" alt="Mountain landscape">
<p>And that's a full tour of the available styles. Happy writing!</p>
`.trim();

async function main() {
  const existing = await db.select().from(posts).where(eq(posts.slug, slug));

  const values = {
    title: "The Complete Style Showcase",
    slug,
    visibility: "public" as const,
    tags: ["Demo"],
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
    description:
      "A demo article showcasing every supported text style on the blog.",
    content,
    readingTimeMinutes: 3,
  };

  if (existing.length > 0) {
    const [updated] = await db
      .update(posts)
      .set(values)
      .where(eq(posts.slug, slug))
      .returning();
    console.log("Demo post updated:", updated.slug);
  } else {
    const [created] = await db.insert(posts).values(values).returning();
    console.log("Demo post created:", created.slug);
  }

  console.log(`View it at: /blog/${slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
