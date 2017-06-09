const chai = require('chai');
const cubs = require('../index');
const env = require('node-env-file');
const expect = chai.expect;

chai.should();
chai.use(require('chai-things'));

describe('CUBS Parser', function() {
  before(function() {
    // Load API credentials from a local environment file if available
    env(__dirname + '/../.env', {raise: false});
  });

  it('should have access to environment variables for secrets management', function() {
    expect(process.env.CUBS_URL).to.not.be.an('undefined', 'CUBS_URL not set');
    expect(process.env.CUBS_USERNAME).to.not.be.an('undefined', 'CUBS_USERNAME not set');
    expect(process.env.CUBS_SALT).to.not.be.an('undefined', 'CUBS_SALT not set');
    expect(process.env.CUBS_SECURITY_KEY).to.not.be.an('undefined', 'CUBS_SECURITY_KEY not set');
  });

  it('should parse grants data', function() {
    // Use a higher timeout to fetch the remote file
    this.timeout(90000);

    return cubs.parseGrants()
      .then(function(grants) {
        expect(grants).to.be.an('array').and.to.have.lengthOf.at.least(1);
        expect(grants[0]).to.be.an('object');
        grants.should.all.have.property('AmountAwarded');
        grants.should.all.have.property('CopywrittenSummary');
        grants.should.all.have.property('GrantsProjectID');
        grants.should.all.have.property('Issue');
        grants.should.all.have.property('IssueID');
        grants.should.all.have.property('Lat');
        grants.should.all.have.property('Lng');
        grants.should.all.have.property('Name');
        grants.should.all.have.property('PartPostcode');
        grants.should.all.have.property('Region');
        grants.should.all.have.property('StartDate');
        grants.should.all.have.property('SubRegionID');
      });
  });
});
