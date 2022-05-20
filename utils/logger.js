
const logger = (() => {
    const printLine = (message, data, type) => {
        let printMessage = message;
        if (data) printMessage += " " + JSON.stringify(data)
        console.log("[" + Date() + "] - " + type + " : " + printMessage )
    }

    return {
        info: (message, data) => {
            printLine(message, data, "INFO")
        },
        error: (message, data) => {
            printLine(message, data, "ERROR")
        }
    }

})();

module.exports = logger;