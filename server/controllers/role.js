module.exports = {
	 index: function* (ctx) {
	    yield ctx.render("role/index", { title: 'test-test' });
	 }

}