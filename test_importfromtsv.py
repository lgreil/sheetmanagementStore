import unittest
from unittest.mock import patch, mock_open, MagicMock
import importfromtsv

class TestImportFromTSV(unittest.TestCase):

    @patch('importfromtsv.requests.get')
    @patch('importfromtsv.requests.post')
    def test_get_or_create_person(self, mock_post, mock_get):
        # Mock API responses
        mock_get.return_value.ok = True
        mock_get.return_value.json.return_value = [
            {"pid": 1, "vorname": "John", "name": "Doe"}
        ]

        # Test existing person
        pid = importfromtsv.get_or_create_person("John Doe")
        self.assertEqual(pid, 1)

        # Test creating a new person
        mock_post.return_value.ok = True
        mock_post.return_value.json.return_value = {"pid": 2}
        pid = importfromtsv.get_or_create_person("Jane Smith")
        self.assertEqual(pid, 2)

    @patch('importfromtsv.requests.get')
    @patch('importfromtsv.requests.post')
    @patch('importfromtsv.requests.put')
    def test_create_or_update_stueck(self, mock_put, mock_post, mock_get):
        # Mock API responses
        mock_get.return_value.ok = True
        mock_get.return_value.json.return_value = [
            {"stid": 1, "name": "Symphony No. 5"}
        ]

        # Mock POST and PUT responses
        mock_post.return_value.ok = True
        mock_post.return_value.json.return_value = {"stid": 2}
        mock_put.return_value.ok = True

        # Test updating an existing stück
        row = ["Symphony No. 5", "Beethoven", "", "Classical", "TRUE"]
        importfromtsv.create_or_update_stueck(row)
        mock_put.assert_called_once()

        # Test creating a new stück
        row = ["Symphony No. 9", "Beethoven", "", "Classical", "TRUE"]
        importfromtsv.create_or_update_stueck(row)
        mock_post.assert_called_once()

    @patch('builtins.open', new_callable=mock_open, read_data="Name\tKomponist / Künstler\tArrangiert von\tGenre\tSind Noten digital vorhanden?\nSymphony No. 5\tBeethoven\t\tClassical\tTRUE\n")
    @patch('importfromtsv.create_or_update_stueck')
    def test_main(self, mock_create_or_update_stueck, mock_file):
        # Mock the processing function
        mock_create_or_update_stueck.return_value = None

        # Run the main function
        importfromtsv.main()

        # Ensure the file was read and processing function was called
        mock_file.assert_called_once_with("input.tsv", "r", encoding="utf-8")
        mock_create_or_update_stueck.assert_called_once()

if __name__ == '__main__':
    unittest.main()