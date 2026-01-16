const scanFile = async (filePath) => {
  console.log(`AV scan (stub) executed for ${filePath}`);
  return { clean: true, engine: 'stub' };
};

module.exports = { scanFile };
