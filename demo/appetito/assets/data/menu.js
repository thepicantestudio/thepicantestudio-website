/* Appetito menu, transcribed on 14 Oct 2026 from the 15 menu pages on their Zomato listing (02_Reference/menu/).
   Prices in INR before the 7% service charge and GST. Item = [name, description, price, tags].
   price: number, or {v, c, p, f, m, t, e} for veg / chicken / prawns / fish / mushroom / tofu / egg variants.
   tags: s spicy, g gluten free, vg vegan, sig signature, n contains nuts, h healthy. */
window.APP_MENU = [
  { id: 'small', label: 'Small plates', groups: [
    { name: 'Small', items: [
      ['Zucchini Fries', 'Lightly battered zucchini fries with garlic mayo', { v: 295 }],
      ['Loaded Nachos', 'Nachos bowled with cheese, corn, jalapeños and tomato salsa', { v: 325 }],
      ['Corn, Salt & Pepper', 'Crisp corn seasoned with peppers, scallions, Szechwan pepper', { v: 325 }, ['vg']],
      ['Thai Highway Rolls', 'Long and tall spring rolls filled with rice noodles, vegetables, Thai herbs', { v: 345 }, ['vg', 'sig']],
      ['Honey Chilli Potato', 'A street-style sizzler straight from the heart of North India’s Chinese craze', { v: 325 }, ['s']],
      ['Taquitos', 'A taste of Mexico: crisp rolls stuffed with corn, black beans, mozzarella and cheddar', { v: 375 }, ['sig']],
      ['Peri Peri Cheesy Fries', 'Level up your fries with spicy peri peri goodness', { v: 345 }, ['s']],
      ['Kung Pao Lotus Stem', 'Stir-fried lotus stem in a Kung Pao glaze: smoky, sweet, spiked with dried chillies and roasted peanuts', { v: 345 }, ['s', 'n', 'sig']],
      ['Mozzarella Cheese Sticks', 'Crispy, golden fingers filled with melty mozzarella', { v: 375 }],
      ['Crispy Exotic Vegetables', 'Crispy zucchini, mushrooms, baby corn and broccoli tossed with aromatic pepper', { v: 345 }, ['vg']]
    ]},
    { name: 'Plates', items: [
      ['Oven Fresh Pita & Hummus', 'Creamy hummus with warm, freshly baked pita bread', { v: 345 }, ['vg', 'h']],
      ['Thai Basil Chilli', 'Velvety paneer cubes or meaty mushrooms wok-kissed with fresh Thai basil, bird’s eye chillies and a whisper of garlic', { v: 345, m: 375 }, ['s']],
      ['Lettuce Fills', 'Wrap your own lettuce with paneer or chicken tossed in an Asian-style sauce', { v: 345, c: 395 }, ['vg', 'h']],
      ['Chipotle Quesadilla', 'Grilled tortilla stuffed with cheese, bell peppers and spiced veggies, kissed with chipotle heat', { v: 395, c: 425 }],
      ['Stir-Fried Quinoa', 'Fluffy quinoa, fresh seasonal vegetables and aromatic spices', { v: 395, c: 425 }],
      ['Rangoon Wonton', 'Crispy wontons stuffed with luscious cream cheese', { v: 345, c: 395 }],
      ['Vietnamese Grill Chicken', 'Chicken skewers marinated in Hanoi-style spices, grilled to smoky-charred perfection', { c: 395 }, ['g', 's', 'sig']],
      ['Chicken Wings', 'Crispy, golden-brown wings in American hot sauce or Korean gochujang sauce', { c: 375 }, ['s']],
      ['Bangkok Chicken', 'Crispy chicken infused with lemongrass, Thai ginger and crisp basil', { c: 395 }, ['sig']],
      ['Fish & Chips', 'Golden-fried fish in a crisp batter with fries and tartar sauce', { f: 475 }],
      ['Soy Garlic Prawns', 'Prawns wok-tossed in soy sauce, caramelized garlic and fresh herbs', { p: 525 }, ['h']]
    ]},
    { name: 'Salads', items: [
      ['Mexico Maxima', 'Crisp lettuce, sweet corn, black beans and jalapeños with crunchy nachos, salsa, guacamole and smoky chipotle mayo', { v: 375 }, ['vg']],
      ['Quinoa Sunshine', 'Quinoa salad in an orange-lemon vinaigrette', { v: 345 }, ['h', 'sig']],
      ['Caesar Salad', 'Romaine and iceberg with olives, shaved parmesan and a classic creamy Caesar dressing', { v: 345, c: 395 }]
    ]},
    { name: 'Soups', items: [
      ['Earthy Tomato Basil', 'Roasted tomato basil soup', { v: 245 }, ['n']],
      ['Crème de Mushroom', 'Aromatic mushrooms blended into creamy earthy flavours', { v: 245, c: 275 }, ['sig']],
      ['Manchow', 'A spicy soup with vegetables, ginger, garlic and oriental spices', { v: 245, c: 275 }, ['vg']],
      ['Hot & Sour', 'A spicy, tangy broth with tofu, mushrooms, bamboo shoots and vegetables', { v: 245, c: 275 }, ['s']],
      ['Clear Wonton', 'Silky-soft wontons in a crystal-clear broth with ginger, garlic and scallions', { v: 245, c: 275 }]
    ]},
    { name: 'Sharing platters', items: [
      ['Lebanese Veg Mezze', 'Falafel, cigarillos, hummus, moutabel, tzatziki, marinated olives, cottage cheese samosa, pita. Add harissa chicken skewers (2) for 150', { v: 775 }, ['sig']],
      ['Pan Asian Veg Platter', 'Thai spring rolls, chilli paneer, honey chilli potatoes, Rangoon wonton', { v: 775 }],
      ['Pan Asian Chicken Platter', 'Vietnamese grilled chicken, summer rolls, chilli chicken, chicken Rangoon wonton', { c: 895 }]
    ]},
    { name: 'Dim sum', items: [
      ['Crystal Jade', 'Translucent parcels filled with crunchy water chestnuts, shiitake and carrots', { v: 345 }],
      ['Philly Willy', 'Cream cheese, peppery scallions and a drizzle of truffle oil in soft steamed dumplings', { v: 345 }],
      ['Pan Grilled', 'Dumplings tossed in a sizzling chilli garlic sauce and finished on the grill', { v: 375, c: 425 }, ['s', 'sig']],
      ['Thai Yellow', 'Pan-seared dumplings with exotic vegetables and bird’s eye chilli on a bed of Thai mango', { v: 375, c: 425 }],
      ['Phuket Town', 'Thai dim sum with sweet basil, bird’s eye chilli and Thai herbs', { v: 345, c: 375 }, ['s']],
      ['Chilli Oil', 'Dumplings drenched in aromatic chilli oil, toasted spices and crispy garlic', { v: 345, c: 375 }, ['s', 'sig']],
      ['Jhol Dim Sum', 'Nepali-style dumplings floating in an aromatic jhol broth', { v: 375, c: 425 }, ['s']]
    ]}
  ]},
  { id: 'mains', label: 'Mains', groups: [
    { name: 'Fresh dough pizza', note: 'Hand-kneaded daily, house marinara, baked and finished with EVOO', items: [
      ['Queen Margherita', 'Basil, cheddar, mozzarella, parmesan', { v: 545 }],
      ['Four Cheese', 'Cheddar, mozzarella, parmesan, ricotta', { v: 645 }],
      ['Pesto Primo', 'House-made pesto, sun-dried tomatoes, mozzarella, mascarpone', { v: 645 }, ['n']],
      ['Veggie Ville', 'Broccoli, mushrooms, olives, rucola, mozzarella', { v: 645 }],
      ['Mexican Wave', 'Bell peppers, sweet corn, onions, jalapeños, mozzarella', { v: 645 }],
      ['Mad Mushroom', 'Shiitake, button mushrooms, mozzarella, ricotta', { v: 645 }, ['sig']],
      ['Peri Peri Paneer', 'Paneer, onions, red paprika, mozzarella', { v: 645 }, ['s']],
      ['Chicken Shroom Supreme', 'Mushroom, grilled chicken, onions, mozzarella', { c: 695 }],
      ['Chipotle Chicken', 'Chipotle-marinated chicken, mozzarella', { c: 695 }, ['s']],
      ['Chicken Slam', 'Chicken salami, chicken tikka, sour cream, mozzarella', { c: 695 }, ['sig']]
    ]},
    { name: 'Pastas', items: [
      ['Fettuccini al Funghi', 'Creamy mushroom sauce, sautéed mushrooms, garlic, herbs, parmesan', { v: 475 }],
      ['Tortellini', 'Spinach and ricotta parcels in a velvety tomato cream sauce', { v: 495 }],
      ['Aglio e Olio', 'Spaghetti in olive oil, chilli flakes, cherry tomatoes and parmesan', { v: 445, c: 495 }],
      ['Penne all’Arrabbiata', 'A fiery pasta with tomatoes, garlic and chilli peppers', { v: 445, c: 495 }],
      ['Penne Primavera Rosa', 'Vegetables and penne blanketed in a tomato cream sauce', { v: 445, c: 495 }],
      ['Pesto Spaghetti', 'Fresh basil, parmesan and cherry tomatoes tossed with spaghetti', { v: 445, c: 495 }, ['n']],
      ['Penne Alfredo', 'Creamy Alfredo sauce, parmesan and cracked pepper', { v: 445, c: 495 }],
      ['Peri Peri Penne', 'Penne in peri peri sauce for that smooth heat and tangy undertone', { v: 475, c: 525 }, ['s', 'sig']],
      ['Lasagna', 'Pasta sheets stacked with grilled vegetables, tomato sauce, mascarpone and mozzarella', { v: 525, c: 575 }, ['sig']]
    ]},
    { name: 'Burgers', items: [
      ['Garden Veggie', 'Crispy potato-veggie patty, lettuce, tomatoes, caramelized onions, garlic mayo', { v: 375 }],
      ['Mexican Sombrero', 'Burrito in a bun: crispy patty, brown rice, black beans, Mexican-spiced veggies, jalapeños, salsa, nachos', { v: 375 }, ['sig']],
      ['Grilled Chicken', 'Thyme-seasoned chicken patty, lettuce, gherkins, tomatoes, mustard dip', { c: 395 }],
      ['Spicy Chicken', 'Peri peri chicken patty, caramelised onions, crisp lettuce, toasted bun', { c: 395 }, ['s', 'sig']]
    ]},
    { name: 'Large plates', items: [
      ['Cottage Cheese Steak with Rice', 'Grilled cottage cheese steak, creamy bell pepper sauce, herbed rice', { v: 545 }],
      ['Enchilada', 'Rolled tortillas with spicy veggies and black beans, baked with cheese and spiced tomato sauce', { v: 545, c: 595 }, ['s', 'sig']],
      ['Chicken Costoletta', 'Panko-crusted chicken, citrus cream sauce, mashed potatoes, grilled vegetables', { c: 595 }],
      ['Grilled Fish', 'Fish fillet with lemon butter, creamy mash and grilled veggies', { f: 645 }],
      ['Butter Garlic Prawns', 'Bay prawns in sizzling butter-garlic, cracked black pepper and cilantro', { p: 675 }],
      ['Wild Mushroom Risotto', 'Arborio rice with forest mushrooms, white wine and parmesan', { v: 525, c: 575 }, ['sig']],
      ['Sun-Dried Tomato Risotto', 'Creamy arborio rice with sun-dried tomatoes and basil', { v: 525, c: 575 }],
      ['Makhani Dal', 'Slow-cooked overnight; with paratha or jeera rice and kachumber salad', { v: 445 }],
      ['Kadai Paneer', 'Spiced tomato-onion gravy with bell peppers; with paratha or jeera rice', { v: 495 }, ['sig']],
      ['Butter Chicken', 'The chef’s signature butter tomato gravy; with paratha or jeera rice', { c: 525 }, ['s', 'sig']],
      ['Chettinad Curry', 'Tamil coconut and cashew spiced curry; with paratha or jeera rice', { v: 495, c: 545, p: 595 }, ['s']]
    ]},
    { name: 'Sides', items: [
      ['Malabar Paratha', '', 50], ['Pita Bread', '', 50], ['Potato Mash', '', 125], ['Sauté Vegetables', '', 125], ['Garlic Bread', '', 175], ['French Fries', '', 245]
    ]},
    { name: 'Bowls', note: 'One person. Served 12 pm to 6 pm', items: [
      ['Lebanese Falafel', 'Quinoa, crispy falafel, creamy hummus, spiced chickpeas, pickled vegetables', { v: 475 }],
      ['Mexican Burrito', 'Seasoned black beans, crisp veggies, guacamole, salsa and sour cream over herbed rice', { v: 475, c: 525 }, ['sig']],
      ['Burmese Khow Suey', 'Noodles in a rich coconut broth with Asian veggies and traditional toppings', { v: 475, c: 525 }, ['n', 'sig']],
      ['Korean Ramen', 'Slow-simmered gochujang broth, noodles, shiitake and exotic veggies', { v: 475, c: 525 }],
      ['Bangkok Curry', 'Steamed jasmine rice with Thai red (fiery) or green (mild, aromatic) curry', { v: 475, c: 525, p: 575 }, ['sig']],
      ['Grilled Chicken Bowl', 'Grilled chicken breast and charred vegetables over seasoned quinoa', { c: 525 }, ['h']]
    ]},
    { name: 'Asian mains', items: [
      ['Pattaya Greens', 'Garden-fresh greens and tofu in an aromatic Thai basil broth', { v: 445 }, ['vg', 'g']],
      ['Stir-fried Vegetables in Hot Garlic Sauce', 'Indo-Chinese garlic sauce, red chillies and soy', { v: 445 }, ['s']],
      ['Cornchurian', 'Corn nuggets in a Manchurian glaze with wok-tossed greens', { v: 445 }, ['vg']],
      ['Thai Curry', 'Green or red curry simmered with coconut milk, vegetables, kaffir lime and galangal', { v: 445, c: 495, p: 575 }, ['vg', 'sig']],
      ['Kung Pao', 'Stir-fried with roasted peanuts, smoky red chillies and house-made Kung Pao sauce', { v: 445, t: 495, c: 495, p: 575 }, ['s', 'n', 'sig']],
      ['Thai Basil Chicken', 'Krapow: chicken stir-fried in a wok with holy basil', { c: 495 }, ['s']],
      ['Seoul Chicken', 'Bell peppers and zucchini in a slow-simmered gochujang, soy and sesame sauce', { c: 495 }],
      ['Ikan Lada Hitam', 'Malaysian fish with Asian vegetables in black pepper sauce', { f: 545 }],
      ['Wok Tossed Prawns', 'Flash-fried prawns in the signature six-element sauce: soy, chilli, ginger, garlic, sesame, lime', { p: 595 }, ['sig']]
    ]},
    { name: 'Noodles', items: [
      ['Hakka', '', { e: 325, c: 355, p: 395 }],
      ['Chilli Garlic', '', { e: 345, c: 375, p: 425 }, ['s']],
      ['Phad Thai', 'Flat rice noodles with crunchy peanuts, tamarind, garlic, chilli and a squeeze of lime', { v: 395, c: 425, p: 475 }, ['g', 'n']],
      ['Pad Kee Mao', 'Flat rice noodles with Thai chillies, garlic, onions, bell peppers and holy basil', { v: 395, c: 425, p: 475 }, ['s', 'g', 'sig']]
    ]},
    { name: 'Rice', items: [
      ['Singapore Fried Rice', '', { e: 345, c: 375, p: 425 }, ['s']],
      ['Triple Fried Rice', 'Fluffy rice, saucy Hakka noodles and crunchy fried noodles in Schezwan gravy', { e: 425, c: 475, p: 495 }, ['sig']],
      ['Fried Rice', '', { e: 325, c: 355, p: 395 }],
      ['Chilli Garlic Rice', '', { e: 345, c: 375, p: 425 }, ['s']],
      ['Schezwan Rice', '', { e: 345, c: 375, p: 425 }, ['s']],
      ['Steamed Rice', '', 275, ['vg']], ['Jasmine Rice', '', 295, ['vg']]
    ]}
  ]},
  { id: 'drinks', label: 'Drinks & desserts', groups: [
    { name: 'Hot coffees', items: [
      ['Espresso', 'Concentrated shot of coffee', 175], ['Americano', 'Espresso topped with hot water', 175], ['Cappuccino', 'Espresso, steamed milk foam', 225],
      ['Latte', 'Espresso with steamed milk and a layer of froth', 225], ['Matcha Latte', 'Your daily dose of Zen', 250, ['sig']], ['Caffè Mocha', 'Espresso, chocolate and steamed milk', 250]
    ]},
    { name: 'Cold coffees', note: 'Add-on flavours 50: elderflower, passion fruit, strawberry, butter caramel, hazelnut', items: [
      ['Blended Cold Coffee', 'Chilled, smooth, with an invigorating caffeine kick', 250, ['sig']], ['Iced Café Latte', 'Cold, frothy milk meets bold espresso over ice', 250],
      ['Iced Americano', 'Espresso diluted with water, served chilled and strong', 250], ['Iced Mocha', 'Sweet chocolate and espresso served refreshingly cold', 250],
      ['Iced Matcha', 'Earthy and totally refreshing green tea', 275]
    ]},
    { name: 'Tea', items: [
      ['Jasmine', 'Fragrant, delicate, subtly sweet', 175], ['Green Tea', 'Aromatic and refreshing', 175], ['Honey Mint Tea', 'Sweet honey and refreshing mint, a Himalayan special', 175, ['sig']]
    ]},
    { name: 'Mocktails', items: [
      ['Mojito', 'Mint, crisp lime and a hint of sweetness. Original, passion fruit, strawberry or green apple', 250],
      ['Midnight Sparkle', 'Juicy Indian java plums, spices and a zesty lemony spritzer', 250, ['sig']],
      ['Mango Mary', 'A fiery twist on the Bloody Mary with mango, tomato, lime and a spice kick', 250],
      ['Mango Colada', 'Mango, creamy coconut and pineapple juice', 250],
      ['Elderflower Elixir', 'Tangy, with hints of tropical fruit and floral notes', 250],
      ['Mandarin Lime Lullaby', 'Mandarin orange, passion fruit and kaffir lime leaf', 250, ['sig']],
      ['Tiki Tropics', 'A Pina Colada mocktail with refreshing pineapple juice', 250]
    ]},
    { name: 'Cold brewed', items: [
      ['Iced Tea', 'Lemon, peach, passion fruit, lychee or peach apricot (sugar-free)', 250],
      ['French Lime Iced Coffee', 'Espresso and a dance of lime', 250]
    ]},
    { name: 'Shakes', items: [
      ['Nutella', 'Nutella, milk, ice cream and chocolate drizzle', 275], ['Strawberry Banana', 'Sweet strawberries and velvety bananas', 275],
      ['Kit Kat', 'Chocolatey nostalgia and creamy indulgence', 275, ['sig']], ['Peanut Butter', 'Made with real peanut butter', 275, ['n']],
      ['Oreo', 'Creamy, chocolatey, with Oreo cookie crumbles', 275], ['Strawberry Matcha', 'Fruity and subtly earthy matcha', 275, ['sig']],
      ['Caramel Shake with Biscoff', 'Sweet and salty', 275, ['sig']]
    ]},
    { name: 'Cold pressed juices', items: [['Watermelon', '', 275, ['vg']], ['Malta Orange', '', 275, ['vg']], ['Pineapple', '', 275, ['vg']]] },
    { name: 'Soft drinks', items: [
      ['Bottled Water', '', 60], ['Coke / Sprite / Fanta', '', 150], ['Coke Zero', '', 150], ['Fresh Lime Soda', '', 150], ['Masala Lemonade', '', 150], ['Red Bull', '', 250]
    ]},
    { name: 'Desserts', items: [
      ['Affogato', 'A hot and cold love story: vanilla ice cream meets a shot of steaming espresso', 295],
      ['Brownie with Ice Cream', 'Brownie topped with creamy ice cream, drizzled in chocolate', 295],
      ['Tiramisu', 'Coffee-soaked sponge with mascarpone cream and a dusting of cocoa', 325, ['sig']],
      ['New York Cheesecake', 'With strawberry compote and whipped cream', 325],
      ['Caramel Panna Cotta', 'Velvety Italian custard topped with golden caramel', 325]
    ]}
  ]}
];
