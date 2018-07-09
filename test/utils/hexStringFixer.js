function fixString(str) {
	return str.replace(/\0/g, '')
}

module.exports = fixString