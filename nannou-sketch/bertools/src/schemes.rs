use lazy_static::lazy_static;
use nannou::color::Hsla;

pub fn navy() -> [Hsla; 3] {
    [
        Hsla::new(212.0, 0.856, 0.3, 1.0), // #0B498E
        Hsla::new(23.0, 0.25, 0.937, 1.0), // #f3eeeb
        Hsla::new(212.0, 0.856, 0.1, 1.0), // #rgb(4 24 47)
    ]
}

lazy_static! {
    pub static ref CARIBBEAN_CURRENT: Hsla = Hsla::new(185.0, 1.0, 0.23, 1.0);
    pub static ref TIFFANY_BLUE: Hsla = Hsla::new(174.0, 0.36, 0.64, 1.0);
    pub static ref ALICE_BLUE: Hsla = Hsla::new(195.0, 0.5, 0.95, 1.0);
    pub static ref CHOCOLATE_COSMOS: Hsla = Hsla::new(352.0, 1.0, 0.15, 1.0);
    pub static ref CLARET: Hsla = Hsla::new(340.0, 1.0, 0.22, 1.0);
    pub static ref AMARANTH: Hsla = Hsla::new(351.0, 0.59, 0.53, 1.0);
    pub static ref CORAL: Hsla = Hsla::new(16.0, 1.0, 0.66, 1.0);
    pub static ref SANDY_BROWN: Hsla = Hsla::new(25.0, 1.0, 0.66, 1.0);

    /// See https://coolors.co/palette/006d77-83c5be-edf6f9
    pub static ref SCHEME_FLATGREEN: [Hsla; 3] = [*CARIBBEAN_CURRENT, *TIFFANY_BLUE, *ALICE_BLUE,];

    // See https://coolors.co/palette/4f000b-720026-ce4257-ff7f51-ff9b54
    pub static ref SCHEME_VALENTINE: [Hsla; 5] = [
        Hsla::new(345.0, 1.0, 0.15, 1.0),
        Hsla::new(342.0, 0.6, 0.45, 1.0),
        Hsla::new(348.0, 0.7, 0.6, 1.0),
        Hsla::new(20.0, 1.0, 0.5, 1.0),
        Hsla::new(30.0, 1.0, 0.6, 1.0),
    ];
}
