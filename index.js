// Deal with mouse scroller
{
    $('#scroll-horizontally').on("mousewheel", e => {
        e = window.event || e;
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.getElementById('scroll-horizontally').scrollLeft -= (delta * 40); // Multiplied by 40
        e.preventDefault();
    });
}
var currentId = undefined;
var storage = {};
function showImage(id) {
    currentId = id;
    if (id in storage) {
        $('#largeImage').attr('src', storage[id].data.Character.image.large);
        $('.character-discription').html(storage[id].data.Character.description);
        return;
    }
    $('#largeImage').attr('src', 'assets/loading.svg');
    $('.character-discription').html('');
    let query = `
query ($id: Int) { # Define which variables will be used in the query (id)
  Character (id: $id) {
    image {
        large
    }
    description(asHtml: true)
  }
}
`;
    $.ajax({
        method: 'POST',
        url: 'https://graphql.anilist.co',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: JSON.stringify({
            query: query,
            variables: {
                id: id
            }
        }),
        success: json => {
            storage[id] = json;
            if (typeof (currentId) === "undefined" || currentId === id) {
                $('#largeImage').attr('src', json.data.Character.image.large);
                $('.character-discription').html(json.data.Character.description);
            }
        },
        error: xhr => {
            console.error(xhr);
            $('#largeImage').attr('src', 'assets/none.svg');
            $('.character-discription').html('');
        }
    })

}
// load characters
$.getJSON("json/character-list.json", json => {
    console.log(json);
    for (let i in json) {
        let charElement = document.createElement('img');
        $(charElement).attr({
            class: 'char-img',
            'data-index': i.toString(),
            style: `--height:${json[i].height};`,
            src: json[i].imgsrc,
            alt: json[i].name,
            title: json[i].name
        });
        $(charElement).on("load", (function () {
            $('#scroll-horizontally').scrollLeft($('#scroll-horizontally')[0].scrollWidth);
        }));
        $(charElement).mouseenter(function () {
            $('.char-img').removeClass('selected bounce');
            $(this).addClass('selected bounce');
            $('#characterName').text(json[i].name);
            showImage(json[i].al_id);
        }).mouseleave(() => currentId = undefined);
        $('#char-imgs-container').append(charElement);
    }
});