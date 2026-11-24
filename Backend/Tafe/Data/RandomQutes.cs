class RandomQutes
{
    public static readonly List<string> arFooter =
    [
        "منور يا غالي، ومطرح ما يسري يمري! ☕",
        "اضحك للدنيا، القهوة عليك والروقان علينا.",
        "الروقان مش محتاج مناسبة، محتاج كوباية مظبوطة.",
        "اشرب وانسى الهم، بكرة أحلى بإذن الله.",
        "شرفتونا، ولمتنا تحلى بيكم دايماً!",
        "الباقي؟ هاتوا بيه حتة شوكليت على ذوقك.",
        "اللي يشرب قهوتنا، لازم ينورنا تاني.",
        "الجحود وحش، ما تنساش تسيب بقشيش للويتر الغلبان! 😂",
        "انسى العالم الخارجي، ورايق مع فنجانك.",
        "مزاجك غالي علينا، استمتع بكل رشفة.",
        "يا عم رايق، اطلب وزود السكر براحتك.",
        "تشرب قهوة؟ تسيب همومك برة.",
        "القعدة الحلوة بتكمل بوجودكم.",
        "نورت الكافيه، ونتشرف بيك في أي وقت!",
        "لو الحساب عالي، افتكر إن السعادة ملهاش سعر! 😉",
        "اضبط دماغك، وسيب الباقي علينا.",
        "القهوة المظبوطة لـ الناس المظبوطة.",
        "شربت؟ يلا على الشغل وماتكسلش! ⚡",
        "طعم يعدل المزاج ويقفل الدماغ.",
        "منورنا والله، تكررها تاني إن شاء الله!"
    ];

    public static readonly List<string> enFooter =
    [
        "Thanks for stopping by! Come back soon. ☕",
        "Good vibes, great coffee.",
        "Sip, relax, and enjoy the moment.",
        "Your daily dose of caffeine and happiness.",
        "Have a great day ahead!",
        "Life happens, coffee helps.",
        "Fueling your day, one cup at a time.",
        "Stay caffeinated and keep smiling.",
        "Great ideas start with great coffee.",
        "Made with love and a lot of caffeine."
    ];
    public static string GetRandomQute(List<string> values)
    {
        var random = new Random();
        int index = random.Next(values.Count);
        return values[index];
    }
}