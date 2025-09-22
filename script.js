// Function to show status messages
function showStatus(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Function to handle form submission
async function submitForm(event) {
    event.preventDefault(); // Prevent default form submission
    
    const form = event.target; // Get the form element
    const formData = new FormData(form); // Create FormData object from form
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        // Show loading state
        showStatus('Submitting form...', 'info');
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        const response = await fetch('http://localhost:5000/api/products/upload/form', {
            method: 'POST',
            body: formData // Send FormData directly (don't set Content-Type header)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Success:', result);
            
            // Show detailed success message with generated tags
            let successMsg = 'Form submitted successfully!';
            if (result.tags) {
                successMsg += ` Generated ${result.tags.categories?.length || 0} categories and sustainability score: ${(result.tags.eco_impact_score * 100).toFixed(1)}%`;
            }
            showStatus(successMsg, 'success');
            form.reset(); // Clear the form
        } else {
            // Try to get error details from response
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (e) {
                // If we can't parse JSON, use default error
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error submitting form. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', submitForm);
});