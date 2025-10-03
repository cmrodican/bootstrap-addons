
    document.getElementById('docLink').addEventListener('click', function (e) {
        e.preventDefault(); // Prevents the default link behavior
        e.stopPropagation(); // Stops the event from bubbling up and closing the dropdown
        // Get the target tab element
        var targetTab = document.getElementById('tab-help-tab');
        // Use Bootstrap's tab instance to show the tab
        var tab = new bootstrap.Tab(targetTab);
        tab.show();
    });
    // Function to create and build the modal
    function createDynamicModal() {
        // 1. Embed the JSON data directly as a JavaScript object
        const data = {
            "modalTitle": "About Sample Application"
            , "appTitle": "Sample Application"
            , "appVersion": "2.5.0"
            , "aboutContent": "This application provides a sample of dynamic content generation. It was developed by a team of dedicated programmers."
            , "aboutLinkText": "Visit our website"
            , "aboutLinkUrl": "https://example.com"
            , "componentsContent": "List of components used: Bootstrap, jQuery, Custom Scripts."
            , "authorsContent": "Main Authors: John Doe, Jane Smith."
        };
        const container = document.getElementById('about-modal');
        // 2. Use a template literal to construct the modal HTML string
        const modalHTML = `
        <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h1 class="fs-5" id="aboutModalLabel">${data.modalTitle}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 2px black solid"></button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-3">
                                <i class="bi bi-window fs-1"></i>
                            </div>
                            <div class="col-9">
                                <h3>${data.appTitle}</h3>
                                <h4 class="fs-6">Version ${data.appVersion}</h4>
                                
                                <ul class="nav nav-tabs" id="myTab" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">About</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Components</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">Authors</button>
                                    </li>
                                </ul>
                                
                                <div class="tab-content" id="myTabContent">
                                    <div class="tab-pane fade show active py-3" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                                        <p>${data.aboutContent}</p>
                                        <a href="${data.aboutLinkUrl}">${data.aboutLinkText}</a>
                                    </div>
                                    <div class="tab-pane fade py-3" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                                        ${data.componentsContent}
                                    </div>
                                    <div class="tab-pane fade py-3" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
                                        ${data.authorsContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
        // 3. Insert the created HTML into the container
        container.innerHTML = modalHTML;
    }
    // Call the function when the page content is fully loaded
    document.addEventListener('DOMContentLoaded', createDynamicModal);
