module.exports = (lang = 'en',name=null) => {
    const friend_request = {
        "en": "Friend Request",
        "hi":"मित्रता अनुरोध",
        "sa":"मित्रतायाः अभ्यर्थना",
        "ta":"நண்பர் கோரிக்கை",
        "gu":"મિત્રની વિનંતી!"
    }

    const request_message = {
        "en":`${name} sent you a friend request!`,
        "hi":`${name} ने आपको मित्रता अनुरोध भेजा है!`,
        "sa":`${name} इति त्वाम् मित्रतायाः निवेदनम् प्रेषितवान्`,
        "ta":`${name} உங்களுக்கு நண்பர் கோரிக்கை அனுப்பியுள்ளார்!`,
        "gu":`${name} તમને મિત્રની વિનંતી મોકલી છે!`
    }

    const friend_request_accpted_title = {
        "en": "Friend Request Accepted",
        "hi":"मित्रता अनुरोध स्वीकृत",
        "sa":"मित्रतायाः अभ्यर्थना स्वीकृताा",
        "ta":"நண்பர் கோரிக்கை ஏற்கப்பட்டதுை",
        "gu":"મિત્રની વિનંતી સ્વીકારવામાં આવી છે"
    }

    const friend_request_accpted = {
        "en":`${name} accepted your request!`,
        "hi":`${name} ने आपके अनुरोध को स्वीकार कर दिया`,
        "sa":`${name} इति तव अभ्यर्थनाम् स्वीकृतवान्`,
        "ta":`${name} உங்கள் கோரிக்கையினை ஏற்று கொண்டார்`,
        "gu":`${name} તમારી વિનંતી સ્વીકારી છે`
    }

    const friend_request_rejected_title = {
        "en": "Friend Request Rejected",
        "hi":"मित्रता अनुरोध अस्वीकृत",
        "sa":"मित्रतायाः अभ्यर्थना निरस्ता",
        "ta":"நண்பர் கோரிக்கை நிராகரிக்கப்பட்டுவிட்டதுை",
        "gu":"મિત્રની વિનંતીને નામંજૂર કરવામાં આવી છે!"
    }

    const friend_request_rejected = {
        "en":`${name} rejected your request!`,
        "hi":`${name} ने आपके अनुरोध को अस्वीकार कर दिया!`,
        "sa":`${name} इति तव अभ्यर्थनाम् अस्वीकृतवान्`,
        "ta":`${name} உங்கள் கோரிக்கையை நிராகரித்துவிட்டார்`,
        "gu":`${name} તમારી વિનંતી નામંજૂર કરી છે`
    }

    const tagged_in_album_title = {
        "en": "Tagged in an album",
        "hi":"एक एल्बम में आपको टैग किया",
        "sa":"एकस्याम् संकलिकायाम् टैग्ड इतिता",
        "ta":"ஆல்பத்தினை டேக் செய்கை",
        "gu":"આલ્બમમાં ટેગ કર્યો છે"
    }

    const tagged_in_album = {
        "en":`${name} tagged you in an album!`,
        "hi":`${name} ने एक एल्बम में आपको टैग किया`,
        "sa":`${name} इति एकस्याम् संकलिकायाम् त्वाम् टैग्ड इति कृतवान्`,
        "ta":`உங்களை ${name} ஓர் ஆல்பத்தில் குறிப்பிட்டுள்ளார்்`,
        "gu":`${name}  આલ્બમમાં તમને ટેગ કર્યા છે`
    }

    const album_added_title = {
        "en": "New album added",
        "hi":"नया एल्बम जोड़ा गया",
        "sa":"New album added",
        "ta":"புதிய ஆல்பம் சேர்க்கப்பட்டது",
        "gu":"નવું આલ્બમ ઉમેર્યું"
    }

    const album_added = {
        "en": `${name} added a new album`,
        "hi":`${name} एक नया एल्बम जोड़ा`,
        "sa":`${name} added a new album`,
        "ta":`${name} புதிய ஆல்பத்தைச் சேர்த்துள்ளார்`,
        "gu":`${name} એક નવું આલ્બમ ઉમેર્યુંી`
    }

    const comment_on_album_title = {
        "en": "Comment on your album",
        "hi":"आपके एल्बम पर टिप्पणी/कमेंट",
        "sa":"तव संकलिकायाम् टिप्पणी",
        "ta":"உங்கள் ஆல்பத்தின் மீது கருத்துுை",
        "gu":"તમારા આલ્બમ પર ટિપ્પણી કરો"
    }

    const comment_on_album = {
        "en":`${name} commented on your album`,
        "hi":`${name} ने आपके एल्बम पर टिप्पणी/कमेंट किया`,
        "sa":`${name} इति तव संकलिकायाम् टिप्पणी अकरोत््`,
        "ta":`${name} உங்கள் ஆல்பத்தில் கருத்து பதிவிட்டுள்ளார்்`,
        "gu":`${name} તમારા આલ્બમ પર ટિપ્પણી કરી છે`
    }

    const like_on_album_title = {
        "en": "Like your album",
        "hi":"आपके एल्बम को लाइक/पसंद किया",
        "sa":"तव संकलिका रुच्यते",
        "ta":"உங்கள் ஆல்பத்தை லைக் செய்துள்ளார்ுுை",
        "gu":"તમારો આલ્બમ પસંદ કરો"
    }

    const like_on_album = {
        "en":`${name} liked your album`,
        "hi":`${name} ने आपके एल्बम को लाइक/पसंद किया`,
        "sa":`${name} इति तव संकलिकाम् आनुशंसत््`,
        "ta":`${name} அவர்களுக்கு உங்கள் ஆல்பம்  பிடித்திருக்கிறது்`,
        "gu":`${name} તમારા આલ્બમને પસંદ કર્યો છે`
    }

    const member_added_title = {
        "en": "Family member added",
        "hi":"पारिवारिक सदस्य जोड़े गए",
        "sa":"गृहजन सदस्यः तु संकलयितःे",
        "ta":"குடும்ப உறுப்பினர் சேர்க்கப்பட்டார்",
        "gu":"પરિવારના સભ્ય ઉમેરવામાં આવ્યા છેો"
    }

    const member_added = {
        "en":`${name} added you in his family member tree`,
        "hi":`${name} ने अपने वंश वृक्ष में आपको जोड़ा`,
        "sa":`${name} तु त्वाम् स्व वंशवृक्षे संकलितम् कृतवान््`,
        "ta":`${name} குடும்ப உறுப்பினர் மரத்தில் உங்கள் பெயரை சேர்த்துள்ளார்`,
        "gu":`${name} તેમના પરિવારનાં સભ્ય વૃક્ષમાં તમને ઉમેર્યા છે`
    }

    const kahani_added_title = {
        "en": "New kahani added",
        "hi":"नई कहानी जोड़ी गई",
        "sa":"New kahani added",
        "ta":"புதிய கஹானி சேர்க்கப்பட்டது",
        "gu":"નવી કહાની ઉમેરીે"
    }

    const kahani_added = {
        "en": `${name} added a new kahani`,
        "hi":`${name} एक नई कहानी जोड़ी गई`,
        "sa":`${name} added a new kahani`,
        "ta":`${name} புதிய கஹானியைச் சேர்த்தார்`,
        "gu":`${name} નવી કહાની ઉમેરીી`
    }

    const comment_on_kahani_title = {
        "en": "Comment on your kahani",
        "hi":"आपकी कहानी पर टिप्पणी/कमेंट",
        "sa":"तव कथायाम् टिप्पणी",
        "ta":"உங்கள் கதையில் கருத்து பதிவிடப்பட்டுள்ளதுுுை",
        "gu":"તમારી કહાની પર ટિપ્પણી કરો"
    }

    const comment_on_kahani = {
        "en":`${name} commented on your kahani`,
        "hi":`${name} ने आपकी कहानी पर टिप्पणी/कमेंट किया`,
        "sa":`${name} इति तव कथायाम् टिप्पणी कृतवान््`,
        "ta":`உங்கள் கதையில் ${name} கருத்து பதிவிட்டுள்ளார்்`,
        "gu":`${name} તમારી કહાની પર ટિપ્પણી કરી છે`
    }

    const like_on_kahani_title = {
        "en": "Like your kahani",
        "hi":"आपकी कहानी को पसंद किया गया",
        "sa":"तव कथायाः अनुशंसा",
        "ta":"உங்கள் கதையினை விரும்பியுள்ளார்ுுை",
        "gu":"તમારી કહાની પસંદ કરો"
    }

    const like_on_kahani = {
        "en":`${name} liked your kahani`,
        "hi":`${name} ने आपकी कहानी को पसंद किया`,
        "sa":`${name} इति तव कथाम् आनुशंसत् `,
        "ta":`${name} உங்கள் கதையினை விரும்பியுள்ளார்`,
        "gu":`${name} તમારી કહાની પસંદ કરી છે`
    }

    const comment_on_recipe_title = {
        "en": "Comment on your recipe",
        "hi":"आपकी रेसिपी पर टिप्पणी/कमेंट",
        "sa":"तव पाकविधौ टिप्पणी",
        "ta":"உங்கள் சமையல் குறிப்பின் மீதான கருத்துுுுை",
        "gu":"તમારી વાનગી પર ટિપ્પણી કરો"
    }

    const comment_on_recipe = {
        "en":`${name} commented on your recipe`,
        "hi":`${name} ने आपकी रेसिपी पर टिप्पणी/कमेंट कियाा`,
        "sa":`${name} इति तव पाकविधौ टिप्पणीम् अकरोत््`,
        "ta":`${name} உங்கள் சமையல் குறிப்பில் கருத்து பதிவிட்டுள்ளார்்்`,
        "gu":`${name} તમારી વાનગી પર ટિપ્પણી કરી છે`
    }

    const like_on_recipe_title = {
        "en": "Liked your recipe",
        "hi":"आपकी रेसिपी को पसंद किया गया",
        "sa":"तव पाकविधिः आनुशंसितःा",
        "ta":"உங்கள் சமையல் குறிப்பினை விரும்பியுள்ளார்ுுை",
        "gu":"તમારી વાનગી પસંદ કરી છેો"
    }

    const like_on_recipe = {
        "en":`${name} liked your recipe`,
        "hi":`${name} ने आपकी रेसिपी को पसंद किया`,
        "sa":`${name} इति तव पाकविधिम् आनुशंसत् `,
        "ta":`${name} உங்கள் சமையல் குறிப்பினை விரும்பியுள்ளார்்`,
        "gu":`${name} તમારી વાનગી પસંદ કરી છે`
    }

    const recipe_added_title = {
        "en": "New recipe added",
        "hi":"नई रेसिपी जोड़ी गई",
        "sa":"New recipe added",
        "ta":"புதிய செய்முறை சேர்க்கப்பட்டது",
        "gu":"નવી રેસીપી ઉમેરીે"
    }

    const recipe_added = {
        "en": `${name} added a new recipe`,
        "hi":`${name} एक नया रेसिपी जोड़ा`,
        "sa":`${name} added a new recipe`,
        "ta":`${name} புதிய செய்முறையைச் சேர்த்தது`,
        "gu":`${name} નવી રેસીપી ઉમેરી`
    }

    const wish_title = {
        "en": "Wish message",
        "hi":"शुभकामना संदेश",
        "sa":"शुभेच्छा संदेशः",
        "ta":"வாழ்த்து செய்தி",
        "gu":"વિશ સંદેશ"
    }

    const wish_message = {
        "en":`${name} send you a wish message : `,
        "hi":`${name} आपको शुभकामना संदेश भेज रहा है : `,
        "sa":`${name} तुभ्यम् शुभेच्छा संदेशम्अप्रेषयत् : `,
        "ta":`${name} உங்களுக்கு வாழ்த்து தகவலை அனுப்பியுள்ளார்் : `,
        "gu":`${name} તમને વિશ સંદેશ મોકલ્યો છે : `
    }

    const comment_on_wish_title = {
        "en": "Comment on your greetings",
        "hi":"आपके शुभकामना संदेश पर टिप्पणी की",
        "sa":"commented on your greetings",
        "ta":"உங்கள் வாழ்த்துக்களில் கருத்து தெரிவித்துள்ளார்ுுுை",
        "gu":"તમારી શુભેચ્છાઓ પર ટિપ્પણી કરી"
    }

    const comment_on_wish = {
        "en":`${name} commented on your greetings`,
        "hi":`${name} ने आपके शुभकामना संदेश पर टिप्पणी किया`,
        "sa":`${name} commented on your greetings`,
        "ta":`${name} உங்கள் வாழ்த்துக்களில் கருத்து தெரிவித்துள்ளார்்்`,
        "gu":`${name} તમારી શુભેચ્છાઓ પર ટિપ્પણી કરી`
    }

    const like_on_wish_title = {
        "en": "liked your greetings",
        "hi":"आपका शुभकामना संदेश पसंद किया",
        "sa":"liked your greetings",
        "ta":"உங்கள் வாழ்த்துக்கள் பிடித்திருந்தது்ுுை",
        "gu":"તમારી શુભેચ્છાઓ ગમ્યુંેો"
    }

    const like_on_wish = {
        "en":`${name} liked your greetings`,
        "hi":`${name} ने आपका शुभकामना संदेश पसंद किया`,
        "sa":`${name} liked your greetings`,
        "ta":`${name} உங்கள் வாழ்த்துக்கள் பிடித்திருந்தது`,
        "gu":`${name} તમારી શુભેચ્છાઓ ગમ્યું`
    }

    return {
        friend_request: friend_request[lang],
        request_message:request_message[lang],
        friend_request_accpted_title:friend_request_accpted_title[lang],
        friend_request_accpted:friend_request_accpted[lang],
        friend_request_rejected_title:friend_request_rejected_title[lang],
        friend_request_rejected:friend_request_rejected[lang],
        album_added_title:album_added_title[lang],
        album_added:album_added[lang],
        tagged_in_album_title:tagged_in_album_title[lang],
        tagged_in_album:tagged_in_album[lang],
        comment_on_album_title:comment_on_album_title[lang],
        comment_on_album:comment_on_album[lang],
        like_on_album_title:like_on_album_title[lang],
        like_on_album:like_on_album[lang],
        member_added_title:member_added_title[lang],
        member_added:member_added[lang],
        kahani_added_title:kahani_added_title[lang],
        kahani_added:kahani_added[lang],
        comment_on_kahani_title:comment_on_kahani_title[lang],
        comment_on_kahani:comment_on_kahani[lang],
        like_on_kahani_title:like_on_kahani_title[lang],
        like_on_kahani:like_on_kahani[lang],
        recipe_added_title:recipe_added_title[lang],
        recipe_added:recipe_added[lang],
        comment_on_recipe_title:comment_on_recipe_title[lang],
        comment_on_recipe:comment_on_recipe[lang],
        like_on_recipe_title:like_on_recipe_title[lang],
        like_on_recipe:like_on_recipe[lang],
        wish_title:wish_title[lang],
        wish_message:wish_message[lang],
        comment_on_wish_title:comment_on_wish_title[lang],
        comment_on_wish:comment_on_wish[lang],
        like_on_wish_title:like_on_wish_title[lang],
        like_on_wish:like_on_wish[lang],
    }
}
