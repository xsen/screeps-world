import fs from 'fs';
import path from 'path';
import axios from 'axios';


interface Modules {
  [key: string]: string
}

const modules: Modules = {
  main: fs.readFileSync(path.resolve(__dirname, 'dist/main.cjs'), 'utf-8'),
  // 'utils': fs.readFileSync(path.resolve(__dirname, 'dist/utils.js'), 'utf-8'),
};

export async function publishToApi() {
  const token = process.env.SCREEPS_TOKEN;
  const branch = process.env.SCREEPS_BRANCH;


  try {
    const response = await axios.post(
      'https://screeps.com/api/user/code',
      {
        branch,
        modules,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
      }
    );
    console.log('Uploaded: ', response.data);
  } catch (error) {
    console.error('Error', error);
  }
}


export async function publishToLocal() {
  const path = `${process.env.SCREEPS_LOCAL_PATH}/${process.env.SCREEPS_BRANCH}`;
  for (let name in modules) {
    fs.writeFileSync(`${path}/${name}.js`, modules[name], {encoding: 'utf8', flag: 'w'});
  }
  console.log("Copying to screeps local: ", path);
}
