
        // Branch Dropdown
        function toggleBranchDropdown() {
            const dropdown = document.getElementById('branchDropdown');
            const chevron = document.getElementById('chevronIcon');
            dropdown.classList.toggle('hidden');
            chevron.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        function selectBranch(branch, event) {
            event.preventDefault();
            document.getElementById('branchText').textContent = branch === 'all' ? 'All Branches' : branch;
            document.getElementById('branchDropdown').classList.add('hidden');
            
            // Update checkmarks
            document.getElementById('allCheck').textContent = branch === 'all' ? '✓' : '';
            document.getElementById('mainCheck').textContent = branch === 'Main Street' ? '✓' : '';
            document.getElementById('downCheck').textContent = branch === 'Downtown' ? '✓' : '';
        }

        // Announcement Modal
        function openAnnouncementModal() {
            document.getElementById('announcementModal').classList.add('active');
        }

        function closeAnnouncementModal() {
            document.getElementById('announcementModal').classList.remove('active');
        }

        function postAnnouncement() {
            alert('Announcement posted successfully!');
            closeAnnouncementModal();
        }

        function refreshAnnouncements() {
            alert('Announcements refreshed');
        }

        // Add User Modal
        function openAddUserModal() {
            document.getElementById('addUserModal').classList.add('active');
        }

        function closeAddUserModal() {
            document.getElementById('addUserModal').classList.remove('active');
        }

        function addUser() {
            alert('User added successfully!');
            closeAddUserModal();
        }

        // Edit Modal
        function openEditModal(userId) {
            document.getElementById('editModal').classList.add('active');
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.remove('active');
        }

        function updateUser() {
            alert('User updated successfully!');
            closeEditModal();
        }

        // Delete Modal
        function openDeleteModal(userId) {
            document.getElementById('deleteModal').classList.add('active');
        }

        function closeDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
        }

        function confirmDelete() {
            alert('User deleted successfully!');
            closeDeleteModal();
        }

        // General Actions
        function refreshAll() {
            alert('Dashboard refreshed');
        }

        function refreshUsers() {
            alert('Users refreshed');
        }

        function goToAttendance() {
            alert('Navigating to Attendance page');
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('branchDropdown');
            const button = event.target.closest('button');
            
            if (dropdown && !dropdown.contains(event.target) && button && button.onclick !== toggleBranchDropdown) {
                dropdown.classList.add('hidden');
            }
        });
    