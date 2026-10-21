import { bulletBlocks } from "@/core/glossary/bulletBlocks";
import { BulletList } from "./bullet-list/BulletList";

/** A definition as plain text, with the Codex's inline "•" bullets as a list under the intro. */
export const Definition = ({ text }: { text: string }) => {
  const { intro, items } = bulletBlocks(text);
  const introText = text.slice(intro.start, intro.end);

  if (items.length === 0) {
    return <p>{introText}</p>;
  }

  return (
    <>
      <p>{introText}</p>
      <BulletList>
        {items.map((item) => (
          <li key={item.start}>{text.slice(item.start, item.end)}</li>
        ))}
      </BulletList>
    </>
  );
};
