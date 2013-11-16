Node webapp powering <http://upload.openspending.org/> which providers upload and a
general interface to <http://data.openspending.org/>.

# For Developers

## Install

Not on npm yet so you'll need to clone the code and then install:

    git clone https://github.com/openspending/os-upload
    cd os-upload 
    npm install .

### Run the app locally

We recommend using the special Procfile-dev which will run using nodemon:

    foreman start -f Procfile-dev

### Deploy

We use heroku.

Deploy to Heroku:

    heroku git:remote -a os-upload
    git push heroku

### Testing

Run them with mocha:

    mocha test

Or the npm way:

    npm test

----

# Architecture and Design

## User Stories

* [ ] As a data contributor or wrangler I want to upload a file for use in
  OpenSpending but I'd like to have somewhere to store it (that's permanent)
  rather than use my own dropbox, drive etc so that I can use the file in my
  import to OpenSpending.org and it has a permanet home
* [ ] As a data contributor I want to archive original data files somewhere
  (not files I may use to import but original data files)
* [ ] I want to see what is in the datastore (size, recent changes)
* [ ] As a Admin I want to see what uploads have happened recently
* [ ]As a OS sysadmin I want somewhere to archive all the datasets in
  openspending so if our db fails we don’t lose everything 

## Overall Plan including File Layout in the DataStore (data.openspending.org)

See https://github.com/openspending/openspending/issues/669

