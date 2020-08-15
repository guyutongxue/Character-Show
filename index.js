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
var imageLinks = {};
function showImage(id) {
    currentId = id;
    if (id in imageLinks) {
        $('#largeImage').attr('src', imageLinks[id]);
        return;
    }
    let link = undefined;
    $('#largeImage').attr('src', 'assets/loading.svg');
    let query = `
query ($id: Int) { # Define which variables will be used in the query (id)
  Character (id: $id) {
    image {
        large
    }
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
            link = json.data.Character.image.large;
            imageLinks[id] = link;
            if (typeof (currentId) === "undefined" || currentId === id) {
                $('#largeImage').attr('src', link);
            }
        },
        error: xhr => {
            console.error(xhr);
            $('#largeImage').attr('src', 'assets/none.svg');
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