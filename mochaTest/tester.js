
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index');

const exampleRequest =  require('./exampleRequest.json');
chai.should();
chai.use(chaiHttp);

/*
 * Test the /GET route. Used for health
 */
describe('/GET to server', () => {
	it('it should GET a simple response from the server', done => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});

/*
 * Test the /POST route to the graylog alert endpoint
 */
describe('/POST to graylog alert endpoint on the application', () => {
	it('it should return 200', done => {
		chai.request(app)
			.post('/graylogAlert')
			.send(exampleRequest)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});

/*
 * Test the /POST route to the graylog alert endpoint with invalid body
 */
describe('/POST to graylog alert endpoint on the application with invalid body', () => {
	it('it should return 400', done => {
		chai.request(app)
			.post('/graylogAlert')
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
	});
});
