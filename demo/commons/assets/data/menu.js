/* Commons menu, from the Swiggy listing (restaurant 1408788), read 14 Oct 2026.
   Swiggy prices can differ from in-cafe prices: confirm with the cafe before launch.
   v = veg, n = non-veg. Single numbers are prices in INR. */
window.HAB_MENU = [
  { id: "panuozzo", label: "Panuozzo & food", groups: [
    { name: "Panuozzo", note: "Wood-fired pizza-dough sandwiches", items: [
      ["Hot Honey Hustle", "Hot honey crunchy chicken, creamy slaw, gherkins.", {n:365}, "star"],
      ["Chickaprese", "Roasted chicken, pesto, buffalo mozzarella, balsamic.", {n:390}, "star"],
      ["Dirty Shawarma", "Loaded juicy chicken, garlicky drip, loaded fries.", {n:365}],
      ["Tikka Theory", "Charred tikka chicken, bold creamy flavours.", {n:365}],
      ["Paneer Popper", "Spicy, crispy, tangy.", {v:325}, "star"],
      ["Caprese Core", "Pesto, buffalo mozzarella, balsamic, juicy tomato.", {v:325}],
      ["Shroom Boom", "Truffle mushrooms with rich umami madness.", {v:325}],
      ["Farmhouse Flex", "Fresh veggies, tangy creamy spread, ratatouille vibes.", {v:300}],
      ["Aloo Crunch 2.0", "Crispy patty, chipotle drip, comfort cheese.", {v:285}]
    ]},
    { name: "Sides", items: [
      ["Zucchini Crunch Fries", "Crispy zucchini, pesto, ranch and hot honey glaze.", {v:260}, "star"],
      ["Commons Garlicky Bread", "Loaded garlic bread, ranch drip.", {v:260}],
      ["Mirchi Drama", "Cream-cheese stuffed mirchis with a spicy punch.", {v:260}],
      ["Truffle Fries", "Truffle-dusted fries, parmesan, truffle mayo.", {v:235}],
      ["Onion Rings", "Golden crispy rings, fiery house dip.", {v:180}],
      ["Peri Peri Fries", "House peri peri sprinkle.", {v:195}],
      ["Classic Fries", "", {v:170}],
      ["Angry Crispy Chicken", "Spicy crispy chicken that bites back.", {n:300}],
      ["Crispy Chicken Pop", "Crunchy chicken bites, creamy sauce.", {n:300}]
    ]},
    { name: "Pasta", items: [
      ["Arrabbiata", "Slow-simmered tomato sauce with a spicy kick.", {v:325}],
      ["Alfredo", "Silky white sauce, garlic butter finish.", {v:300}],
      ["Rose Sauce", "Arrabbiata meets alfredo.", {v:325}],
      ["Creamy Pesto", "Basil pesto with a garlic-herb soul.", {v:335}]
    ]},
    { name: "Dessert", items: [
      ["Basque Burnt Cheesecake", "Eggless. Soft centre, caramelised top.", {v:390}, "star"]
    ]}
  ]},
  { id: "matcha", label: "Matcha Bar", groups: [
    { name: "Matcha Bar", items: [
      ["Strawberry Shortcake Matcha", "", 390, "star"],
      ["Alphonso Mango Matcha", "", 390],
      ["Banana Loaf Matcha", "", 390],
      ["Blueberry Matcha Pop", "", 390],
      ["Cookies & Cream Matcha", "", 390],
      ["Smoked Vanilla Matcha", "", 325],
      ["Rose Matcha", "", 390],
      ["Iced Matcha Latte", "", 390]
    ]}
  ]},
  { id: "coffee", label: "Coffee & coolers", groups: [
    { name: "Cold coffee & lattes", items: [
      ["Strawberry Cloud Latte", "", 325, "star"],
      ["Pistachio Cloud Latte", "", 325],
      ["Brown Butter Latte", "", 325],
      ["Tiramisu Creamy Latte", "", 325],
      ["Salted Caramel Latte", "", 325],
      ["Smoked Vanilla Latte", "", 325],
      ["Blueberry Latte", "", 325],
      ["Alphonso Mango Latte", "", 325],
      ["Hazel Hustle", "", 325],
      ["Biscoff Bomb", "", 325],
      ["Tiger Bomb", "", 325],
      ["Mont Blanc", "", 325],
      ["Vietnamese Coffee", "", 325],
      ["Commons Cold Coffee", "", 260, "star"],
      ["Iced Mocha", "", 260],
      ["Iced Latte", "", 245],
      ["Iced Americano", "", 205]
    ]},
    { name: "Coolers & mocktails", items: [
      ["Red Sangria", "", 220],
      ["Indian Summer", "", 195],
      ["Appletini", "", 195],
      ["Litchi Temptation", "", 195],
      ["Yuzu Ice Tea", "", 170],
      ["Alpenliebe", "", 149],
      ["Fresh Basil Lemonade", "", 130],
      ["Ice Tea", "", 130],
      ["Mojito", "", 130]
    ]}
  ]}
];
