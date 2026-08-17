module.exports.timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.askCheck = async (fanficContext) => {
  const readline = require("node:readline/promises");
  const { stdin: input, stdout: output } = require("node:process");
  const rl = readline.createInterface({ input, output });

  const ask = async () => {
    const answer = await rl.question(
      `В фэндоме "${fanficContext.name}" подозрительно мало работ. Проверить? (д/н) `,
    );

    if (answer === "д") {
      console.log(`${fanficContext.url}\n`);
    } else if (answer !== "н") {
      await ask();
    }

    rl.close();
  };

  await ask();
};

module.exports.askDelete = async () => {
  const readline = require("node:readline/promises");
  const { stdin: input, stdout: output } = require("node:process");
  const rl = readline.createInterface({ input, output });
  let answer;

  const ask = async () => {
    answer = await rl.question(`Перезаписать количество работ? (д/н) `);

    if (answer === "н") {
      console.log("не перезаписано\n");
    } else if (answer !== "д") {
      await ask();
    }

    rl.close();
  };

  await ask();

  return new Promise((resolve) => {
    if (answer === "д" || answer === "н") {
      resolve(answer);
    }
  });
};
