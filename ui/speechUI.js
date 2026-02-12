/* --------------------------------------------------------------------------
   15. MÉTÉO PARLÉE
-------------------------------------------------------------------------- */
const btnSpeak = document.getElementById("btn-speak");

//ui/speechUI.js
function speech(txt) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(txt);
  utter.lang = "fr-FR";
  synth.speak(utter);
}