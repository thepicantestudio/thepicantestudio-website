/* Habidade menu data.
   Drinks: kraft beverage booklet photographed by Raunak, 14 Oct 2026 (two prices = House Blend / Single Estate).
   Food: white food menu photographed by Raunak, 14 Oct 2026 (prices per veg / non-veg / prawn).
   TO CONFIRM WITH THE CAFE: the food menu may be an older version; starters appear on two pages with different
   prices (Chicken Strips 289 vs 329, Seekh Kebabs 289 vs 329, Mezze Non-Veg 289 vs 389), the higher page is used.
   Matcha prices were not on the photographed pages, so matcha items carry no price yet.
   v = veg, n = non-veg, p = prawn. A plain number is a single price; {h, s} = house blend / single estate. */
window.HAB_MENU = [
  { id: "coffee", label: "Coffee", groups: [
    { name: "Hot coffee", note: "House blend / Single estate", items: [
      ["Espresso", "Concentrated double shot.", {h:199,s:229}],
      ["Americano", "Double shot espresso, mineral water.", {h:229,s:249}],
      ["Cappuccino", "Double shot, steamed milk, milk foam.", {h:279,s:299}],
      ["Café Latte", "Double shot, steamed milk, a light layer of foam.", {h:279,s:299}],
      ["Honey Cinnamon Latte", "Cinnamon and honey. Winter in a cup.", {h:299,s:319}, "star"],
      ["Café Pistachio", "A nutty latte to be savoured.", {h:299,s:319}],
      ["Café Pop-scotch", "Scotch sauce, topped with caramel popcorn.", {h:299,s:319}],
      ["Café O-Monk", "The Old Monk latte with apple crumble. Contains no alcohol.", {h:299,s:319}, "star"],
      ["Café J-Daniels", "A whisper of JD in your latte. Contains no alcohol.", {h:299,s:319}],
      ["Café Mocha", "Latte, double shot, chocolate.", {h:299,s:319}],
      ["Affogato", "Vanilla ice cream, espresso shot.", {h:309,s:329}]
    ]},
    { name: "Manual brew", note: "House blend / Single estate", items: [
      ["V60 Pour-over", "Hot or iced, through a V60 dripper.", {h:239,s:259}, "star"],
      ["AeroPress", "Steeped, then pressed through a filter.", {h:239,s:259}],
      ["French Press", "Coarse grind, immersion, plunge.", {h:239,s:259}],
      ["Chemex", "Infusion method, clean and bright.", {h:239,s:259}]
    ]},
    { name: "Iced coffee", note: "House blend / Single estate", items: [
      ["Iced Cloud Latte", "Mildly sweetened vanilla cloud on top.", {h:309,s:329}, "star"],
      ["Iced Americano", "Double shot over ice.", {h:199,s:219}],
      ["Iced Coffee Pop", "Espresso over ice, fizzy soda.", {h:229,s:249}],
      ["Espresso Tonic", "Double shot over ice and tonic.", {h:279,s:299}],
      ["Iced Cappuccino", "Over creamy milk, frothed.", {h:279,s:299}],
      ["Iced Latte", "Double shot over ice, creamy milk.", {h:279,s:299}],
      ["Iced Berry Latte", "A symphony of berries in an iced latte.", {h:309,s:329}],
      ["Bombon", "Espresso and condensed milk, shaken over ice.", {h:309,s:329}]
    ]},
    { name: "Cold brew", note: "Single estate", items: [
      ["Classic Cold Brew", "12 to 14 hours. Dried raisins, low acidity.", 239],
      ["Tropical Minty Cold Brew", "Cold brew, coffee, mint. Havana in a glass.", 259],
      ["Green Shrub", "Coffee shrub with green apple.", 239, "star"],
      ["Yuzu Shrub", "Coffee shrub with yuzu.", 239]
    ]},
    { name: "Ice-cream blend", note: "House blend / Single estate", items: [
      ["Classic", "Espresso shots and ice cream.", {h:289,s:309}],
      ["Brownie", "Chocolate walnut brownie, ice cream.", {h:329,s:349}],
      ["Smeared Biscoff", "Biscoff sauce, ice cream, Biscoff crumbs.", {h:299,s:319}, "star"],
      ["Crumbled Jack", "Whiskey-like concoction, apple crumble.", {h:299,s:319}],
      ["Brave Pistachio", "Pistachios and ice cream.", {h:299,s:319}],
      ["Peanut Butter", "Peanut butter cold coffee.", {h:299,s:319}],
      ["Smoked Butter", "Burnt butter and honey.", {h:299,s:319}],
      ["Chocolate Almond", "Chocolate syrup, almonds.", {h:299,s:319}],
      ["Caramel Pop-Scotch", "Caramel popcorn, scotch sauce.", {h:299,s:319}],
      ["The Nutty Monk", "Rum-like concoction and nuts.", {h:299,s:319}],
      ["Berry Swirl", "Mixed berries swirled in.", {h:299,s:319}]
    ]}
  ]},
  { id: "beyond", label: "Beyond coffee", groups: [
    { name: "Mojitos & coolers", items: [
      ["Mandarin Orange Mojito", "Yuzu orange, lemon and mint, muddled.", 279, "star"],
      ["Watermelon Mojito", "Watermelon, mint and lemon.", 279],
      ["Mango Mojito", "Mango pulp for a tropical punch.", 279],
      ["Strawberry Mojito", "Fruity and bubbly at once.", 279],
      ["Cuban Mojito", "Sweet, citrus, herbaceous.", 269],
      ["Bull Mojito", "The virgin mojito with an energy kick.", 269],
      ["Green Apple Soda-Licious", "Try it and find out.", 279],
      ["Apple Mint Sparkle", "Apple and mint, sparkling finish.", 279],
      ["Kaffir Zing Lemonade", "Kaffir lime with a masala twist.", 279],
      ["Tropical Sunset", "Muskmelon and mango.", 279],
      ["Lemonade (Masala / Plain)", "A Delhi-6 classic.", 239],
      ["Fresh Lime Soda", "Simplicity at its best.", 239]
    ]},
    { name: "Shakes, chai & teas", items: [
      ["Sea Salted Caramel & Cookie Shake", "Caramel, sea salt, cookie bits.", 329],
      ["Nutty Belgian Brownie Shake", "Hazelnuts and Belgian chocolate.", 329],
      ["Adrak Wali Chai", "Ginger chai, with or without sugar.", 169],
      ["Lemon Ice Tea", "Home-brewed.", 259],
      ["Peach Ice Tea", "Home-brewed.", 259],
      ["Apple Cinnamon Ice Tea", "Home-brewed.", 259],
      ["Raspberry Ice Tea", "Home-brewed.", 259]
    ]},
    { name: "Kombucha", items: [
      ["Heal", "Turmeric and ginger.", 269],
      ["Warm", "Apple and cinnamon.", 269],
      ["Spark", "Rhododendron and basil.", 269],
      ["Breathe", "Borage, Japanese mint, lemongrass.", 269],
      ["Vision", "Blue pea, Swiss chard, lemon.", 269],
      ["Berry", "Strawberry, gooseberry, mulberry.", 269]
    ]},
    { name: "Matcha", note: "Prices to be added", items: [
      ["Kyoto Matcha Latte", "Ceremonial matcha, milk.", null, "star"],
      ["Berry High Matcha", "Berries layered under matcha.", null],
      ["Coco Matcha", "Coconut and matcha.", null],
      ["Mango Monsoon Matcha", "Mango and matcha.", null]
    ]}
  ]},
  { id: "food", label: "Food", groups: [
    { name: "Starters", items: [
      ["Rice Paper Rolls", "Mentioned in 158 Google reviews.", null, "star"],
      ["Jalapeño Cheese Poppers", "Jalapeño and mozzarella, garlic mayo.", {v:229}],
      ["Mediterranean Veg Platter", "Falafel, paprika and beetroot hummus, zaatar pita.", {v:239}],
      ["Mezze Non-Veg Platter", "Shish taouk, two hummus, pita, lavash.", {n:389}],
      ["Bhut Jolokia Chicken Wings", "Ghost pepper sauce. Not for the shy.", {n:289}, "star"],
      ["Wings in Korean BBQ Sauce", "With home-made coleslaw.", {n:289}],
      ["Chicken Crispers", "Panko fingers, peri peri.", {n:329}],
      ["Chicken Strips", "Flour-dusted juliennes, house sauce.", {n:329}],
      ["Chicken Seekh Kebabs", "With ulta tawa paratha.", {n:329}],
      ["Butter Garlic Prawns", "Butter, garlic, chives.", {p:389}]
    ]},
    { name: "Pan-Asian & sushi", items: [
      ["Veg Dumplings", "Cabbage, mushroom, chives.", {v:249}],
      ["Chicken Dumplings", "Minced chicken, home-made chilli oil.", {n:259}, "star"],
      ["Shu Choi Crystal Dumplings", "Broccoli, paneer, mushroom, corn.", {v:289}],
      ["Hai Kai Crystal Dumplings", "Chicken and prawn.", {n:289}],
      ["Yasai Avocado Sushi", "Nori, sesame oil, avocado.", {v:359}],
      ["Chikin Sushi", "Chicken, nori, avocado.", {n:389}],
      ["Ebi Avo Sushi", "Prawn and avocado.", {p:459}]
    ]},
    { name: "Salads & soups", items: [
      ["Saigon Bowl", "Vietnamese-style, sweet chilli, rice crispies.", {v:249,n:249,p:345}],
      ["Arugula, Avo & Walnut Salad", "Balsamic, seasonal grapes, goat cheese.", {v:289,n:289,p:385}],
      ["Buffalo Mozzarella Caesar", "Kale, parmesan, sourdough croutons.", {v:289,n:289,p:385}],
      ["Tom Yum Soup", "Kaffir lime, galangal, chilli.", {v:189,n:199,p:259}],
      ["Vegetables & Sea-weed Soup", "Chinese home-style.", {v:189,n:199,p:259}],
      ["Cantonese Herb Soup", "Sweet corn, radish, jujube.", {v:189,n:199,p:259}]
    ]},
    { name: "Sourdough sandwiches", items: [
      ["TLC", "Tomato, lettuce, cucumber, olives, cheese.", {v:309}],
      ["Mushroom & Cheese Grilled", "Caramelised onion, mustard, arugula.", {v:329}, "star"],
      ["Grilled Cottage Cheese", "Barbecue marinade, cheese.", {v:329}],
      ["Peri-Peri Paneer Tikka", "Hung curd, Indian spices.", {v:329}],
      ["Chicken & Hummus", "Pickled veg, home-made hummus.", {n:339}],
      ["Pesto Grilled Chicken", "Pesto, sundried tomatoes.", {n:345}],
      ["Peri-Peri Chicken Tikka", "Hung curd, Indian spices.", {n:345}]
    ]},
    { name: "Burgers", items: [
      ["The Local Garden Burger", "Home-made veg patty.", {v:289}],
      ["Crumbed Cottage Cheese Burger", "Jalapeño, cilantro, basil.", {v:305}],
      ["Chicken & Cheese", "Stuffed with smoky cheddar.", {n:345}],
      ["Crispy Barbeque Chicken", "Garlic, thyme, tangy barbecue.", {n:345}],
      ["Mutton Thrust Burger", "Yogurt mint, avocado.", {n:405}],
      ["The Chicken Brothers", "Double chicken, honey mustard.", {n:459}],
      ["The Burger Affair", "Chicken and lamb patties, fried egg.", {n:459}],
      ["Mutton Mongers", "Double mutton, fried egg.", {n:485}]
    ]},
    { name: "Pizzas", items: [
      ["Margarita", "Home-made crust, marinara, mozzarella.", {v:405}],
      ["Taste of Italy", "Five cheeses, goat cheese included.", {v:425}, "star"],
      ["Country Delight", "Peppers, corn, mushroom.", {v:425}],
      ["Chicken Clog", "Salami, grilled chicken, sausage.", {n:489}],
      ["Barbeque Chicken", "Olives, mushrooms, cherry tomato.", {n:489}]
    ]},
    { name: "Pastas", items: [
      ["Chef's Special Aglio Olio", "Pink fettuccine, blanched in beetroot.", {v:389,n:449,p:485}, "star"],
      ["Fettuccine Arrabbiata, Burrata & Basil Oil", "Fresh arrabbiata, burrata.", {v:389,n:449,p:485}],
      ["Fettuccine in Spicy Chicken Ragu", "Home-made ragu.", {n:485}],
      ["Baked Mac & Cheese", "Parmesan crust, fried onions.", {v:389,n:449}],
      ["Rigatoni Bianca", "Béchamel, cream, parmesan.", {v:389,n:449,p:485}],
      ["Peri-Peri Rigatoni", "Spicy tomato, chilli flakes.", {v:389,n:449,p:485}],
      ["The Pink Rigatoni", "Béchamel meets arrabbiata.", {v:389,n:449,p:485}]
    ]},
    { name: "Bowls & big plates", items: [
      ["Dal Makhani Bowl", "With rice and kachumber.", {v:389}],
      ["Kung Pao Bowl", "Peanuts, chilli, home-made kimchi.", {v:389,n:449,p:485}],
      ["Thai Red Curry Bowl", "Coconut milk, hand-ground paste.", {v:389,n:449,p:485}],
      ["Thai Green Curry Bowl", "Coconut milk, hand-ground paste.", {v:389,n:449,p:485}],
      ["Classic Hyderabadi Biryani", "With salad and salan.", {v:389,n:449,p:485}],
      ["Thalasseri Biryani", "Northern Kerala flavours.", {v:389,n:449,p:485}],
      ["Grilled Cottage Cheese, Pesto Centre", "Parsley rice, paprika sauce.", {v:389}],
      ["Grilled Vegetables, Parsley Herb Rice", "Balsamic, barbecue sauce.", {v:389}],
      ["Stuffed Grilled Chicken, Black Pepper", "Mushroom and spinach, chicken jus.", {n:485}],
      ["Peri-Peri Chicken Steak", "Grilled veg, sourdough.", {n:485}],
      ["Grilled Fish, Creamy Mustard", "Sole, mash, grilled veg.", {n:499}]
    ]},
    { name: "Baker's oven & jars", items: [
      ["Butter Croissant", "", {n:171}],
      ["Almond Croissant", "", {n:190}],
      ["Chocolate Croissant", "", {n:190}],
      ["Honey Almond Cake Slice", "Wholewheat.", {v:190}],
      ["Banana Walnut Cake Slice", "Wholewheat.", {v:190}],
      ["Muffins", "Walnut, oats and raisin, double chocolate.", {v:149}],
      ["Chocolate Walnut Brownie", "", {n:159}],
      ["Cookie Brownie", "", {n:159}],
      ["Apple Pie with Ice Cream", "", {v:239}],
      ["Brownie with Nuts & Ice Cream", "", {v:239}],
      ["Lotus Biscoff Caramel Jar", "Cheesecake jar.", {v:249}, "star"],
      ["Nutella Jar", "Cheesecake jar.", {v:249}],
      ["Tiramisu Jar", "Cheesecake jar.", {v:249}]
    ]}
  ]}
];
