JSMocka.Integration.ScrewUnit();

Screw.Unit(function() {
    Screw.Matchers.object = null;
    Screw.Matchers.control = null;

    before(function() {
        object = {};
        control = new JSMocka(object);
    });
});