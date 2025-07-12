import style from './style.module.css';
import { ReactComponent as Delete } from './../../assets/svgs/trash.svg';
import { ReactComponent as Edit } from './../../assets/svgs/icons/Edit.svg';
import { ReactComponent as Download } from './../../assets/svgs/icons/Download.svg';
import { ReactComponent as Report } from './../../assets/svgs/icons/report.svg'; 
import { useNavigate } from "react-router-dom";

function EditList(props) {
    const { setEdit, setDelete, isFile, isImage, postId, showEditDelete = true , communityId } = props;
    const navigate = useNavigate();

    console.log('id in list :' , communityId)
    const handleEditClick = () => {
        if (setEdit) setEdit();
    };

    const handleDeleteClick = () => {
        if (setDelete) setDelete();
    };

    const handleDownloadClick = () => {
        if (isFile) {
            const content = "This is the content of the file!";
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "example.txt";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "orange";
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.fillText("Hello!", 50, 100);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "myCanvasImage.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        }
    };

    const handleReportClick = () => {
        if (postId) {
            navigate(`/community/${communityId}/report/${postId}`);
        } else {
            alert("Post ID not available for reporting.");
        }
    };

    return (
        <div className={style.Container}>
            {showEditDelete && (
                <button className={style.edBTN} onClick={handleEditClick}>
                    <Edit />
                    <span>Edit</span>
                </button>
            )}

            {(isFile || isImage) && (
                <button className={style.edBTN} onClick={handleDownloadClick}>
                    <Download />
                    <span>Download</span>
                </button>
            )}

            {showEditDelete && (
                <button className={style.edBTN} onClick={handleDeleteClick}>
                    <Delete />
                    <span>Delete</span>
                </button>
            )}

            <button className={style.edBTN} onClick={handleReportClick}>
                <Report />
                <span>Report</span>
            </button>
        </div>
    );
}

export default EditList;
