// OpenLayers haritası ayarları
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
                attributions: [] // OSM kaynak attributions
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 38.9637]), // Türkiye'nin merkezi
        zoom: 6
    })
});

// Nokta katmanı ekleyelim
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
    source: vectorSource
});
map.addLayer(vectorLayer);



// Add Point butonu
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('add-point').addEventListener('click', function () {
    map.once('click', function (event) {
        var coordinates = ol.proj.toLonLat(event.coordinate);
        document.getElementById('pointX').value = coordinates[0].toFixed(4);
        document.getElementById('pointY').value = coordinates[1].toFixed(4);
        document.getElementById('addPointPanel').style.display = 'block';
    });
    });
});

// Save Point fonksiyonu
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('savePoint').addEventListener('click', function () {
        var pointX = document.getElementById('pointX').value;
        var pointY = document.getElementById('pointY').value;
        var pointName = document.getElementById('pointName').value;

        // Back-end'e POST isteği gönder
        fetch('https://localhost:7015/api/Point', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                PointX: pointX,
                PointY: pointY,
                Name: pointName
            })
        }).then(response => response.json())
            .then(data => {
                alert('Point added: ' + data.name);
                document.getElementById('addPointPanel').style.display = 'none';
                // Haritaya nokta ekle
                var pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(pointX), parseFloat(pointY)]))
                });
                vectorSource.addFeature(pointFeature);
            });
    });
});

// Update Point butonu için event handler
document.querySelectorAll('.update-btn').forEach(button => {
    button.addEventListener('click', function () {
        var id = this.getAttribute('data-id');

        // Backend'den güncellenmek istenen veriyi alalım
        fetch(`https://localhost:7015/api/Point/${id}`)
            .then(response => response.json())
            .then(data => {
                // Formu dolduralım
                document.getElementById('updatePointX').value = data.pointX;
                document.getElementById('updatePointY').value = data.pointY;
                document.getElementById('updatePointName').value = data.name;
                document.getElementById('updatePointId').value = data.id;

                // Güncelleme panelini açalım
                document.getElementById('updatePointPanel').style.display = 'block';
            });
    });
});

// Update Point fonksiyonu
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('updatePoint').addEventListener('click', function () {
        var pointX = document.getElementById('updatePointX').value;
        var pointY = document.getElementById('updatePointY').value;
        var pointName = document.getElementById('updatePointName').value;
        var pointId = document.getElementById('updatePointId').value;

        // PUT isteği ile backend'e güncellenmiş veriyi gönderelim
        fetch(`https://localhost:7015/api/Point/${pointId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Id: pointId,
                PointX: pointX,
                PointY: pointY,
                Name: pointName
            })
        }).then(response => {
            if (response.ok) {
                alert('Point updated successfully!');
                document.getElementById('updatePointPanel').style.display = 'none';
                // Harita veya listeyi güncelleyebilirsiniz
            } else {
                alert('Failed to update the point.');
            }
        });
    });
});


// Query Points butonu
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('query-points').addEventListener('click', function () {
        fetch('https://localhost:7015/api/Point')
            .then(response => response.json())
            .then(data => {
                var tableBody = document.querySelector('#pointsTable tbody');
                tableBody.innerHTML = 'https://localhost:7015/api'; // Tabloyu sıfırla

                data.value.forEach(point => {
                    var row = document.createElement('tr');
                    row.innerHTML = `<td>${point.pointX}</td>
                                 <td>${point.pointY}</td>
                                 <td>${point.name}</td>
                                 <td>
                                    <button class="show-btn" data-x="${point.pointX}" data-y="${point.pointY}">Show</button>
                                    <button class="update-btn" data-id="${point.id}">Update</button>
                                    <button class="delete-btn" data-id="${point.id}">Delete</button>
                                 </td>`;
                    tableBody.appendChild(row);
                });

                document.querySelectorAll('.show-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        var x = this.getAttribute('data-x');
                        var y = this.getAttribute('data-y');
                        map.getView().setCenter(ol.proj.fromLonLat([parseFloat(x), parseFloat(y)]));
                        map.getView().setZoom(14);
                    });
                });

                document.querySelectorAll('.update-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        var id = this.getAttribute('data-id');
                        // Güncelleme işlemi için ID'yi kullanarak backend ile iletişime geçin
                        // Form açılabilir, bilgileri değiştirdikten sonra backend'e PUT isteği gönderilir.
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        var id = this.getAttribute('data-id');
                        fetch(`https://localhost:7015/api/Point/${id}`, {
                            method: 'DELETE'
                        }).then(response => {
                            if (response.ok) {
                                alert('Point deleted');
                                this.parentElement.parentElement.remove();
                            }
                        });
                    });
                });

                document.getElementById('queryPanel').style.display = 'block';
            });
    });
});
