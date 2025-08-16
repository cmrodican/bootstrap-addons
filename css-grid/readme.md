# Bootstrap Semantic Grid Addon
This addon provides a simple, semantic approach to creating a full-page layout using CSS Grid. It is designed to complement Bootstrap's existing utility-first grid classes (.g-col-*) by focusing on the overall page structure using HTML5 semantic tags like <header>, <main>, and <footer>.

## Features
Semantic-First Layout: Uses grid-area to map semantic HTML tags to specific areas of the page.

Responsive Design: Automatically stacks content on smaller screens for mobile-first compatibility.

Easy Integration: A single CSS file that can be dropped into any static Bootstrap project.

"Holy Grail" Layout: The default configuration provides a classic and flexible two-column layout with a header, navigation, and footer.

How to Use
Step 1: Link the CSS File
First, include the CSS file for this addon in the <head> of your HTML document, after your main Bootstrap CSS file.

<!-- Your Bootstrap CSS -->
<link rel="stylesheet" href="path/to/bootstrap.css">

<!-- Your semantic grid addon CSS -->
<link rel="stylesheet" href="path/to/bootstrap-semantic-grid.css">

Step 2: Structure Your HTML
Wrap your main page content in a parent container with the .grid-container class. Then, place your semantic HTML tags inside this container.

<div class="grid-container">
    <header>
        <!-- Your header content -->
        <h1>Site Title</h1>
    </header>

    <nav>
        <!-- Your navigation links -->
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </nav>

    <main>
        <!-- Main content of the page -->
        <p>This is the main content area.</p>
    </main>

    <aside>
        <!-- Sidebar content -->
        <p>This is the sidebar area.</p>
    </aside>

    <footer>
        <!-- Footer content -->
        <p>&copy; 2024 Your Company</p>
    </footer>
</div>

That's it! The CSS in the addon will automatically position these elements to create the responsive layout.

Customization
You can easily modify the layout to fit your needs by editing the CSS. For example, to change the column widths or the arrangement of the grid areas on desktop, you would edit the .grid-container block. You can also add more grid-area properties to new semantic tags if needed.