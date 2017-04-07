// Asserts that environment variable is set and returns its value.
// When not set, the application will exit

const assert = envName => _assert(process, console, envName);

const _assert = (process, console, envName) => {
    var env;
    if (!(env = process.env[envName])) {
        console.error("Error: Environment variable '" + envName + "' not set.");
        return process.exit(1);
    } else {
        return env;
    }
};

const get = (envName, deflt) => { return process.env[envName] || deflt }

module.exports = { assert, _assert, get };
