// File Upload Selection Name Display Logic
document.addEventListener('change', function(e) {
    // Check missing file element
    if (e.target && e.target.id === 'resumeFile') {
        const fileInput = e.target;
        const file = fileInput.files[0];
        
        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convert to MB
            
            // Success alert ya simple text update
            console.log("Selected File:", fileName, "Size:", fileSize + "MB");
        }
    }
});