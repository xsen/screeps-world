import axios from "axios";
import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "dotenv";

interface Modules {
  [key: string]: string;
}

config();

function getModules(): Modules {
  return {
    main: fs.readFileSync(
      path.resolve(__dirname, "dist/main.umd.cjs"),
      "utf-8",
    ),
    // 'utils': fs.readFileSync(path.resolve(__dirname, 'dist/utils.js'), 'utf-8'),
  };
}

export async function publishToApi() {
  try {
    const token = process.env.SCREEPS_TOKEN;
    const branch = process.env.SCREEPS_BRANCH;
    const modules = getModules();

    const response = await axios.post(
      "https://screeps.com/api/user/code",
      {
        branch,
        modules,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Token": token,
        },
      },
    );
    console.log("Uploaded: ", response.data);
  } catch (error) {
    console.error("Error in publishToApi:", error);
  }
}

export async function publishToLocal() {
  try {
    const modules = getModules();
    const targetPath = `${process.env.SCREEPS_PATH}/${process.env.SCREEPS_BRANCH}`;

    fs.mkdirSync(targetPath, { recursive: true });

    for (let name in modules) {
      fs.writeFileSync(`${targetPath}/${name}.js`, modules[name], {
        encoding: "utf8",
        flag: "w",
      });
    }
    console.log("Copying to screeps local: ", targetPath);
  } catch (error) {
    console.error("Error in publishToLocal:", error);
  }
}
