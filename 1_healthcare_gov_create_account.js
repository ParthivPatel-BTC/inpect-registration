var casper = require('casper').create();
var fs = require('fs');
var fname = 'registration_form_fields.json';
var save = fs.pathJoin(fs.workingDirectory, fname);

var ALL_KEYS = [
  'state',
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
  'q1',
  'q2',
  'q3',
  'a1',
  'a2',
  'a3'
];

var data = {
  fields: [
    {name: 'state', type: 'select'},
    {name: 'firstName', type: 'text'},
    {name: 'lastName', type: 'text'},
    {name: 'email', type: 'text'},
    {name: 'password', type: 'password', label: ''}, //#password-label-sr
    {name: 'confirmPassword', type: 'confirmPassword'},
    {name: 'securityQuestions', type: 'select', totalAppearance: 3, label: ''}, //#security-label-sr
    {name: 'securityAnswers', type: 'text', totalAppearance: 3},
    {name: 'privacy', type: 'checkbox'}
  ],
  response: {

  }
};

if(!isValidArguments(casper)) {
  console.log(" EXIT - Pass all the options - ", ALL_KEYS.join(", "));
  casper.exit();
}

// All the necessary arguments should be passed. 
// This method will return true only when all the 12 args are available.

function isValidArguments(casper) {
  var keys = Object.keys(casper.cli.options);
  return (keys.length >= ALL_KEYS.length);
          // && 
          // ALL_KEYS.every(function(item) {
          //   return keys.includes(item);
          // });
}

function writeToFile(obj) {
  fs.write(save, obj, 'a');
}

// Read all command line options here.
var options = {
  state: casper.cli.get('state'),
  firstName: casper.cli.get('firstName'),
  lastName: casper.cli.get('lastName'),
  email: casper.cli.get('email'),
  password: casper.cli.get('password'),
  confirmPassword: casper.cli.get('confirmPassword'),
  question1: casper.cli.get('q1').toString(),
  question2: casper.cli.get('q2').toString(),
  question3: casper.cli.get('q3').toString(),
  answer1: casper.cli.get('a1'),
  answer2: casper.cli.get('a2'),
  answer3: casper.cli.get('a3')
}

casper.start('https://www.healthcare.gov/create-account');

casper.thenEvaluate(function() {
  document.querySelector('body').click();
});

casper.then(function() {
  
  // Choose the state
  this.click('[name="homeState"]');

  this.fill('div#main-body-content', {
    'homeState': options.state
  }, false);
  
});

casper.then(function(){

  // If the first name field exists, then fill the whole form.
  if(this.exists("[name='firstName']")){
    
    this.echo("Form exists, now filling the form...");

    this.click('[name="securityQuestions[0]"]');
    this.click('[name="securityQuestions[1]"]');
    this.click('[name="securityQuestions[2]"]');

    // var [pageQuestions, passwordLabel, questionsLabel] = this.evaluate(function() {
    //   var options = document.querySelector('[name="securityQuestions[0]"]').options;
    //   var q = {};
    //   for(var i=0;i<options.length;i++) {
    //     if(options[i].value != "") {
    //       q[options[i].value] = options[i].text;
    //     }
    //   }
    //   var pl = document.querySelector("#password-label-sr").innerText;
    //   var ql = document.querySelector("#security-label-sr").innerText;
    //   return [q, pl, ql];
    // }); 

    // var securityQuestionsObj = data.fields.forEach(function(item) {
    //   if(item['name'] == "securityQuestions") {
    //     item.options = pageQuestions;
    //     item.label = questionsLabel;
    //   } else if(item['name'] == "password") {
    //     item.label = passwordLabel;
    //   } 
    // });

    // writeToFile(JSON.stringify(data));

    this.fillSelectors('div#main-body-content', {
      '[name="securityQuestions[0]"]': options.question1,
      '[name="securityQuestions[1]"]': options.question2,
      '[name="securityQuestions[2]"]': options.question3
    }, false);

    // Have to use sendKeys, can not simply change the values of the fields.
    this.sendKeys('[name="firstName"]', options.firstName);
    this.sendKeys('[name="lastName"]', options.lastName);
    this.sendKeys('[name="email"]', options.email);

    this.sendKeys('[name="password"]', options.password);
    this.sendKeys('[name="confirmPassword"]', options.confirmPassword);

    this.sendKeys('[name="securityAnswers[0]"]', options.answer1);
    this.sendKeys('[name="securityAnswers[1]"]', options.answer2);
    this.sendKeys('[name="securityAnswers[2]"]', options.answer3);

    this.click('[name="privacy"]');
    this.clickLabel('Create account', 'button');

  } else { 
    this.echo("Your state has a diff. site!")
  }
});

casper.wait(4000, function() {

  var [header, label] = casper.evaluate(function() {
    var h1Arr = document.querySelectorAll('.main-body-content div h1');
    var pArr = document.querySelectorAll('.main-body-content div p');
    
    var h1 = "";
    var p = "";

    if(h1Arr.length > 1 && pArr.length > 1) {
      h1 = h1Arr[1].innerText;
      p = pArr[1].innerText;  
    }
    
    return [h1, p];
  }); 
  
  data.response = {
    success: (header == "Check your email"),
    header: header,
    label: label
  }

  writeToFile(JSON.stringify(data));
});

casper.wait(4000,function() {
  casper.capture('healthcare.gov.png', {
    top: 0,
    left: 0,
    width: 1200,
    height: 1200
  });
});


casper.run(function() {
  this.echo('...');
  this.exit();
});
