import fs from "fs";

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function buildUnsubscribeHtml(email: string): string {
  return `<h1>Successfully Unsubscribed</h1><p>The email ${email} has been removed from our marketing list.</p>`;
}

export function listSuppression(suppressionListPath: string): string[] {
  return readJsonFile<string[]>(suppressionListPath, []);
}

export function unsubscribeEmail(
  suppressionListPath: string,
  email: string,
): string[] {
  const suppressionList = readJsonFile<string[]>(suppressionListPath, []);
  if (!suppressionList.includes(email)) {
    suppressionList.push(email);
    fs.writeFileSync(
      suppressionListPath,
      JSON.stringify(suppressionList, null, 2),
    );
  }
  return suppressionList;
}

export function toggleSuppressionEmail(
  suppressionListPath: string,
  email: string,
): string[] {
  let list = readJsonFile<string[]>(suppressionListPath, []);
  if (list.includes(email)) {
    list = list.filter((entry) => entry !== email);
  } else {
    list.push(email);
  }
  fs.writeFileSync(suppressionListPath, JSON.stringify(list, null, 2));
  return list;
}
