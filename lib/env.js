// Asserts that environment variable is set and returns its value.
// When not set, the application will exit

const assert = envName => {
    var env;
    if (!(env = process.env[envName])) {
        console.error("Error: Environment variable '" + envName + "' not set.");
        return process.exit(1);
    } else {
        return env;
    }
};

const get = (envName, deflt) => process.env[envName] || deflt

module.exports = { assert, get };
