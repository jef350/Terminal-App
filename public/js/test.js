
function Tester(event){
    var email1 = document.getElementById('email1').value;
    var email2 = document.getElementById('email2').value;

    if (email1 !== email2) {
        alert('de emails zijn niet hetzelfde!');
        event.preventDefault(); 
    }
}
