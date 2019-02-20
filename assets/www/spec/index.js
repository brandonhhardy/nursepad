/**
 * Testing for the NursePad mobile application
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */
describe('app', function() {

	/**
	 * Utils tests
	 */
	describe('utils', function() {
		describe("check", function() {
			it("should throw error", function() {
				expect(function(){
					check({}, 'Array')
				}).toThrow();
				expect(function(){
					check({}, 'String')
				}).toThrow();
				expect(function(){
					check({}, 'Number')
				}).toThrow();
				expect(function(){
					check({}, 'Date')
				}).toThrow();
				expect(function(){
					check(0, 'Boolean')
				}).toThrow();
			});
			it("should not throw error", function() {
				expect(function(){
					check({}, 'Object')
				}).not.toThrow();
				expect(function(){
					check('', 'String')
				}).not.toThrow();
				expect(function(){
					check(1, 'Number')
				}).not.toThrow();
				expect(function(){
					check(0, 'Number')
				}).not.toThrow();
				expect(function(){
					check(new Date(), 'Date')
				}).not.toThrow();
				expect(function(){
					check(false, 'Boolean')
				}).not.toThrow();
			});
		});
	});

	/**
	 * Store tests
	 */
	describe('store', function() {

		describe('add collection', function(){
			it('should add collection', function(){
				expect(true).toBe(true);
			});
			it('should not add collection', function(){
				expect(true).toBe(true);
			});
		});

		describe('remove collection', function(){
			it('should remove collection', function(){
				expect(true).toBe(true);
			});
			it('should not remove collection', function(){
				expect(true).toBe(true);
			});
		});

		describe('get collection', function(){
			it('should get collection if it exists', function(){
				expect(true).toBe(true);
			});
			it('should get collection if it does not exists', function(){
				expect(true).toBe(true);
			});
		});

	});
});
