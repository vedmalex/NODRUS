const cheerio = require("cheerio");
const fs = require("fs-extra");
// Define the list of allowed tags and their allowed attributes
const ALLOWED_TAGS = {
  a: ["href", "title", "target"],
  aside: [],
  b: [],
  blockquote: [],
  br: [],
  code: [],
  em: [],
  figcaption: [],
  figure: [],
  h3: [],
  h4: [],
  hr: [],
  i: [],
  iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
  img: ["src", "alt"],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  strong: [],
  u: [],
  ul: [],
  div: ["class"],
  video: ["src", "width", "height", "frameborder", "allowfullscreen"],
};

// Define a function to sanitize a single HTML tag
// Define a function to sanitize a single HTML tag
function sanitizeTag($, tag) {
  // Get the tag element from the Cheerio object
  const element = $(tag);
  // Get the list of allowed attributes for the tag
  const allowedAttrs = ALLOWED_TAGS[tag] || [];

  // Remove any attributes that are not allowed
  for (const attr of Object.keys(element.attr())) {
    if (!allowedAttrs.includes(attr)) {
      element.removeAttr(attr);
    }
  }
}

// Define a function to sanitize an entire HTML string
function sanitizeHtml(html) {
  // Load the HTML into a Cheerio object
  const $ = cheerio.load(html);

  // Iterate over all tags in the Cheerio object
  $("*").each((i, el) => {
    if (el.type == "tag") {
      sanitizeTag($, el.name);
    }
  });

  const result = $("*")
    .children()
    .toArray()
    .map((element) => {
      return createTelegraphAPIBlockFromElement(element);
    });

  // Return the sanitized HTML as a string
  // return $.html()
  return [result, $.html()];
}
const file = fs.readFileSync("/Users/vedmalex/work/NODRUS/sources/iso/14.html").toString();

function createTelegraphAPIBlockFromElement(element) {
  if (element.type == "text") {
    const text = element.data.trim();
    if (text) {
      return {
        tag: "p",
        children: [text],
      };
    }
  } else if (element.type == "tag") {
    const { name, attribs, children } = element;
    let res;
    switch (name) {
      case "img":
        res = {
          tag: "figure",
          children: [
            {
              tag: "img",
              attrs: {
                src: attribs.src,
                alt: attribs.alt,
              },
            },
          ],
        };
        break;
      case "a":
        if (attribs.href) {
          res = {
            tag: "a",
            attrs: {
              href: attribs.href,
            },
            children: children.map(createTelegraphAPIBlockFromElement),
          };
        }
        break;
      default:
        res = {
          tag: name,
          children: children.map(createTelegraphAPIBlockFromElement),
        };
    }
    return res;
  }
}

const [json, text] = sanitizeHtml(file);

fs.writeJSONSync("14-p.json", json);
fs.writeFileSync("14-p.html", text);
