use crate::tanks::{TankKind, TankOverview};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Missing {
    Device,
    Animal,
    Plant,
}

impl Missing {
    fn label(self) -> &'static str {
        match self {
            Missing::Device => "thiết bị",
            Missing::Animal => "sinh vật",
            Missing::Plant => "cây",
        }
    }
}

/// What a tank's profile still lacks, per docs/product/tanks.md.
pub fn missing(kind: TankKind, devices: i64, animals: i64, plants: i64) -> Vec<Missing> {
    let (need_device, need_animal, need_plant) = match kind {
        TankKind::Fish => (true, true, false),
        TankKind::Planted => (true, false, true),
        TankKind::Terrarium => (false, false, true),
        TankKind::Paludarium => (false, true, true),
    };
    [(need_device && devices == 0, Missing::Device),
     (need_animal && animals == 0, Missing::Animal),
     (need_plant && plants == 0, Missing::Plant)]
        .into_iter().filter(|(lacks, _)| *lacks).map(|(_, m)| m).collect()
}

fn labels(m: &[Missing], sep: &str) -> String {
    m.iter().map(|m| m.label()).collect::<Vec<_>>().join(sep)
}

pub fn status_text(m: &[Missing]) -> String {
    if m.is_empty() { "Đủ hồ sơ".into() } else { format!("Chưa có {}", labels(m, ", ")) }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Bubble {
    pub text: String,
    pub tank_id: Option<i64>,
}

fn say(text: String, tank_id: Option<i64>) -> Bubble {
    Bubble { text, tank_id }
}

pub fn briefing(tanks: &[TankOverview]) -> Vec<Bubble> {
    let lacking: Vec<_> = tanks.iter().filter(|t| !t.missing.is_empty()).collect();
    match (tanks, lacking.is_empty()) {
        ([], _) => vec![say("Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé.".into(), None)],
        ([one], true) => vec![say(format!("Bể {} đã có hồ sơ đầy đủ.", one.tank.name), None)],
        (all, true) => vec![say(format!("Cả {} bể đều đã có hồ sơ đầy đủ.", all.len()), None)],
        (_, false) => lacking.iter().map(|t| say(
            format!("{} chưa có {}. Bạn thêm giúp mình nhé.", t.tank.name, labels(&t.missing, " và ")),
            t.tank.id)).collect(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tanks::{Tank, TankKind, TankOverview};

    fn ov(id: i64, name: &str, missing: Vec<Missing>) -> TankOverview {
        let status = status_text(&missing);
        TankOverview {
            tank: Tank { id: Some(id), name: name.into(), kind: TankKind::Fish, length_cm: None, width_cm: None,
                         height_cm: None, volume_l: None, setup_date: None, notes: None },
            devices: 0, animals: 0, species: 0, plants: 0, missing, status,
        }
    }

    #[test]
    fn completeness_rules() {
        assert_eq!(missing(TankKind::Fish, 0, 0, 5), vec![Missing::Device, Missing::Animal]);
        assert!(missing(TankKind::Fish, 1, 3, 0).is_empty()); // fish tanks need no plants
        assert!(missing(TankKind::Terrarium, 0, 0, 1).is_empty()); // terra needs no devices
        assert_eq!(missing(TankKind::Planted, 1, 0, 0), vec![Missing::Plant]);
        assert_eq!(missing(TankKind::Paludarium, 0, 0, 0), vec![Missing::Animal, Missing::Plant]);
        assert_eq!(status_text(&[Missing::Device, Missing::Plant]), "Chưa có thiết bị, cây");
        assert_eq!(status_text(&[]), "Đủ hồ sơ");
    }

    #[test]
    fn briefing_copy() {
        assert_eq!(briefing(&[])[0].text, "Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé.");
        let a = ov(1, "Hồ cá 1", vec![]);
        let b = ov(2, "Terra", vec![Missing::Plant]);
        let out = briefing(&[a.clone(), b]);
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].text, "Terra chưa có cây. Bạn thêm giúp mình nhé.");
        assert_eq!(out[0].tank_id, Some(2));
        let two = briefing(&[ov(5, "X", vec![Missing::Device, Missing::Animal])]);
        assert_eq!(two[0].text, "X chưa có thiết bị và sinh vật. Bạn thêm giúp mình nhé.");
        assert_eq!(briefing(&[a.clone(), ov(3, "Hồ cá 2", vec![])])[0].text, "Cả 2 bể đều đã có hồ sơ đầy đủ.");
        assert_eq!(briefing(&[a])[0].text, "Bể Hồ cá 1 đã có hồ sơ đầy đủ.");
    }
}
