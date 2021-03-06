// Imports
nlp = window.nlp_compromise;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAZL7mAKqde17OMDm0hQjUsd2pSQNe53w0",
  authDomain: "sentenceproject.firebaseapp.com",
  databaseURL: "https://sentenceproject.firebaseio.com",
  storageBucket: "",
};
firebase.initializeApp(config);
var firebaseDB = firebase.database();
var sentencesInFirebase = firebaseDB.ref('sentences');
var pastSentences = new Set();

// Tenses
function addTenseLi(label, text) {
  $li = $('<li>').text(text);
  $li.on('click', function(){
    $('#input').val(text);
    processInput();
  });
  $li.addClass("sentence-li")
  $li.append($('<span>').addClass("tense-span").text(label));
  $('#tense-ul').append($li);
}

function showTenses() {
  $('#tense-ul').html("");
  var nlpSentence = nlp.sentence($('#input').val());
  addTenseLi("Past:", nlpSentence.to_past().text());
  addTenseLi("Present:", nlpSentence.to_present().text());
  addTenseLi("Future:", nlpSentence.to_future().text());
}

// POS column functions 
function createColumn(pos, terms, colId) {
  var column = $(colId);
  column.append($('<h2>').html(pos));
  list = $('<ul>');
  terms.forEach(function(term) {
    list.append($('<li>').text(term));
  })
  column.append(list);
}

function getEmptyPosSets() {
  return {  Question: new Set(),
            Noun: new Set(),
            Verb: new Set(),
            Person: new Set(),
            Preposition: new Set(),
            Adjective: new Set(),
            Adverb: new Set(),
            Infinitive: new Set(),
            Possessive: new Set(),
            Gerund: new Set(),
            Date: new Set(),
            Determiner: new Set()
          }
}

function processInput() {
  var parts = getEmptyPosSets();
  var sentence = $('#input').val();
  event.preventDefault();

  showTenses();

  // Split each sentence into POS
  terms = nlp.sentence(sentence).terms;
  terms.forEach(function(term){
    for (pos in term.pos) {
      if (parts.hasOwnProperty(pos)){
        parts[pos].add(term.normal);
      }
    }
  });
  var colCount = 0;
  $('.col').html("");

  for (var key in parts) {
    var colId = "#col"+colCount;
    if (parts[key].size) {
      createColumn(key, parts[key], colId);     
      colCount += 1; 
    } 
  }
};

// Past Sentences
function updatePastSentences(){
  sentencesInFirebase.on('child_added', function(result) {
    addSentence(result.val().sentence);
  });
}

function addSentence(sentence) {
  $pastSentenceUl = $('#past-sentence-ul');
  var previousSize = pastSentences.size;
  pastSentences.add(sentence);
  if (previousSize < pastSentences.size) {
    var $sentenceLi = $('<li>').html(sentence);
    $sentenceLi.addClass("sentence-li");

    $sentenceLi.on('click', function(){
      $('#input').val($sentenceLi.text());
      processInput();
    });
    $pastSentenceUl.append($sentenceLi);
  }
}


// Main
$(document).ready(function() {
  $('#input').val("Enter a sentence here!");
  processInput();
  updatePastSentences();

  // Parse
  $('#input').on('keyup', function(event) {
    if (event.keyCode === 0 || event.keyCode === 32) {
      processInput();
    }
  });

  // Save a full sentence
  $('#input').on('keyup', function(event) {
    var sentence = $('#input').val();
    if (['.', '?', '!'].indexOf(sentence.trim().slice(-1)) > -1) {
        sentencesInFirebase.push({
          sentence: sentence.trim()
      });
    }
    updatePastSentences();
  });
});






