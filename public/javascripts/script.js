// imagem dinâmica do index
$('.carousel').carousel({
    interval: 2000
  })

function goBack() {
    window.history.back();
}
//button vagas mais procuradas

//visualizar vaga

$('.invisivel1').hide();
$('.invisivel2').hide();
$('.invisivel3').hide();
$('.invisivel4').hide();
$('.invisivel5').hide();
$('.invisivel6').hide();

$('.visivel1').on('mouseover', function() {
  $('.invisivel1').show();
});

$('.visivel1').on('mouseout', function() {
  $('.invisivel1').hide();
});

$('.visivel2').on('mouseover', function() {
  $('.invisivel2').show();
});

$('.visivel2').on('mouseout', function() {
  $('.invisivel2').hide();
});

$('.visivel3').on('mouseover', function() {
  $('.invisivel3').show();
});

$('.visivel3').on('mouseout', function() {
  $('.invisivel3').hide();
});

$('.visivel4').on('mouseover', function() {
  $('.invisivel4').show();
});

$('.visivel4').on('mouseout', function() {
  $('.invisivel4').hide();
});

$('.visivel5').on('mouseover', function() {
  $('.invisivel5').show();
});

$('.visivel5').on('mouseout', function() {
  $('.invisivel5').hide();
});

$('.visivel6').on('mouseover', function() {
  $('.invisivel6').show();
});

$('.visivel6').on('mouseout', function() {
  $('.invisivel6').hide();
});



