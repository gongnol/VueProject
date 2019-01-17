module.exports = {
	 index: function* (ctx) {
	    yield ctx.render("resource/index", { title: 'test-test' });
	 }

}